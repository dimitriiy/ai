import { spawn } from "child_process";
import type { Task } from "../types";
import type { AgentResult, AgentStage, CodingAgent } from "./types";
import { saveSession } from "../state";
import readline from "readline";

import "dotenv/config";
import { recordEvent } from "../events";

function toolDetail(input: Record<string, unknown> | undefined): string {
  if (!input) return "";
  const key = ["file_path", "pattern", "command", "url", "description"].find(
    (k) => k in input,
  );
  return key ? String(input[key]).slice(0, 100) : "";
}

export class CliAgent implements CodingAgent {
  name = "claude_cli";

  async apply(
    task: Task,
    worktree: string,
    input: string,
    stage: AgentStage,
  ): Promise<AgentResult> {
    const resumeId = "";
    // getSession(task.id, stage);

    const args = [
      "-p",
      input,
      "--output-format",
      "stream-json",
      "--verbose",
      "--max-turns",
      "20",
    ];
    if (resumeId) args.push("--resume", resumeId);

    const child = spawn("claude", args, {
      cwd: worktree,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += String(chunk);
    });

    const lines = readline.createInterface({
      input: child.stdout,
      crlfDelay: Infinity,
    });

    let modelName: string | null = null;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCostUsd = 0;
    let cacheCreationTokens = 0;
    let cacheReadTokens = 0;

    let sessionId: string | null = null;
    let response = "";

    for await (const line of lines) {
      if (!line.trim()) continue;

      let event: CliEvent;

      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }

      if (event.type === "system" && event.session_id) {
        sessionId = String(event.session_id);
      }

      if (event.type === "assistant") {
        const usage = event.message.usage;
        if (usage) {
          totalInputTokens += usage.input_tokens ?? 0;
          totalOutputTokens += usage.output_tokens ?? 0;
          cacheCreationTokens += usage.cache_creation_input_tokens ?? 0;
          cacheReadTokens += usage.cache_read_input_tokens ?? 0;
        }

        if (!modelName && event.message.model) {
          modelName = event.message.model;
        }

        for (const block of event.message.content) {
          if (block.type === "tool_use") {
            recordEvent(task.id, stage, "agent_tool", {
              tool: block.name,
              detail: toolDetail(block.input),
            });
          }

          if (block.type === "text" && block.text) {
            recordEvent(task.id, stage, "agent_text", {
              text: String(block.text),
            });
          }
        }
      }

      if (event.type === "result" && typeof event.result === "string") {
        response = event.result;

        if (event.total_cost_usd !== undefined) {
          totalCostUsd = event.total_cost_usd;
        }

        if (event.usage) {
          // result.usage — это суммарный usage за все turns
          totalInputTokens = event.usage.input_tokens ?? totalInputTokens;
          totalOutputTokens = event.usage.output_tokens ?? totalOutputTokens;
          cacheCreationTokens =
            event.usage.cache_creation_input_tokens ?? cacheCreationTokens;
          cacheReadTokens =
            event.usage.cache_read_input_tokens ?? cacheReadTokens;
        }
      }
    }

    const code: number = await new Promise((resolve) =>
      child.on("close", (c) => resolve(c ?? 0)),
    );

    if (code !== 0) {
      throw new Error(`claude exited with ${code}: ${stderr.slice(-500)}`);
    }

    if (sessionId) saveSession(task.id, stage, sessionId);

    return {
      response,
      sessionId,
      meta: {
        modelName: modelName ?? undefined,
        totalInputTokens,
        totalOutputTokens,
        totalCostUsd,
      },
    };
  }
}

/** Блоки контента внутри message у assistant/user событий */
export interface TextBlock {
  type: "text";
  text: string;
}

export interface ThinkingBlock {
  type: "thinking";
  thinking: string;
  signature?: string;
}

export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  is_error?: boolean;
  content: string | Array<TextBlock | { type: string; [k: string]: unknown }>;
}

export type ContentBlock =
  | TextBlock
  | ThinkingBlock
  | ToolUseBlock
  | ToolResultBlock;

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

/** system: subtype "init" — первое событие потока, отсюда берём session_id */
export interface SystemInitEvent {
  type: "system";
  subtype: "init";
  session_id: string;
  uuid?: string;
  cwd?: string;
  model?: string;
  tools?: string[];
  mcp_servers?: Array<{ name: string; status: string }>;
  permissionMode?: string;
  slash_commands?: string[];
  apiKeySource?: string;
  output_style?: string;
}

/** system: subtype "compact_boundary" — контекст был сжат */
export interface SystemCompactEvent {
  type: "system";
  subtype: "compact_boundary";
  session_id: string;
  uuid?: string;
  compact_metadata?: {
    trigger: "manual" | "auto";
    pre_tokens: number;
  };
}

export type SystemEvent = SystemInitEvent | SystemCompactEvent;

/** assistant: ответ модели — текст, thinking и вызовы инструментов */
export interface AssistantEvent {
  type: "assistant";
  session_id: string;
  uuid?: string;
  parent_tool_use_id?: string | null;
  message: {
    id: string;
    type: "message";
    role: "assistant";
    model: string;
    content: ContentBlock[];
    stop_reason:
      | "end_turn"
      | "max_tokens"
      | "stop_sequence"
      | "tool_use"
      | null;
    stop_sequence: string | null;
    usage: Usage;
  };
}

/** user: результаты выполнения инструментов, возвращаемые в модель */
export interface UserEvent {
  type: "user";
  session_id: string;
  uuid?: string;
  parent_tool_use_id?: string | null;
  message: {
    role: "user";
    content: string | ContentBlock[];
  };
}

/** result: последнее событие потока, содержит финальный текст и статистику */
export interface ResultEvent {
  type: "result";
  subtype: "success" | "error_max_turns" | "error_during_execution";
  session_id: string;
  uuid?: string;
  is_error: boolean;
  result?: string; // финальный текст, есть только при subtype "success"
  duration_ms: number;
  duration_api_ms: number;
  num_turns: number;
  total_cost_usd: number;
  usage?: Usage;
  permission_denials?: Array<{
    tool_name: string;
    tool_use_id: string;
    tool_input: Record<string, unknown>;
  }>;
}

/** stream_event: частичные дельты, приходят только с --include-partial-messages */
export interface StreamEvent {
  type: "stream_event";
  session_id: string;
  uuid?: string;
  parent_tool_use_id?: string | null;
  event: Record<string, unknown>; // raw SSE-событие Anthropic API
}

/** Любая строка stream-json из stdout `claude -p --output-format stream-json` */
export type CliEvent =
  | SystemEvent
  | AssistantEvent
  | UserEvent
  | ResultEvent
  | StreamEvent;
