import fs from "node:fs";
import path from "node:path";
import { createAgent } from "./agents/index.js";
import type { AgentStage } from "./agents/index.js";
import type { AgentResult } from "./agents/types.js";
import type { Task } from "./types.js";
import { listFiles } from "./fs-utils.js";

export type { AgentStage };
export type AgentMeta = AgentResult["meta"];

export interface AgentCallResult {
  response: string;
  meta: AgentMeta;
}

function renderPrompt(
  stage: AgentStage,
  vars: { title: string; body: string; input: string },
): string {
  const template = fs.readFileSync(
    path.join(import.meta.dirname, "prompts", `${stage}.md`),
    "utf8",
  );
  return template
    .replace("{{title}}", vars.title)
    .replace("{{body}}", vars.body)
    .replace("{{input}}", vars.input);
}

export async function callAgent(
  stage: AgentStage,
  task: Task,
  worktree: string,
  input: string,
): Promise<AgentCallResult> {
  const prompt = renderPrompt(stage, {
    title: task.issueTitle,
    body: task.issueBody,
    input,
  });

  const agent = createAgent();
  const result = await agent.apply(task, worktree, prompt, stage);
  return { response: result.response, meta: result.meta };
}

/** Дерево файлов + содержимое нескольких файлов, похожих на тему issue. */
export function buildContext(task: Task): string {
  const files = listFiles(task.worktreePath!);
  const words = task.issueTitle
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const relevant = files
    .filter((f) => words.some((w) => f.toLowerCase().includes(w)))
    .slice(0, 5);

  const bodies = relevant.map((f) => {
    const content = fs
      .readFileSync(path.join(task.worktreePath!, f), "utf8")
      .slice(0, 6000);
    return `### ${f}\n\`\`\`\n${content}\n\`\`\``;
  });

  return [
    "## Файлы репозитория",
    files.slice(0, 200).join("\n"),
    bodies.length
      ? "\n## Возможно релевантные файлы\n" + bodies.join("\n\n")
      : "",
  ].join("\n");
}

export interface FileChange {
  path: string;
  content: string;
}

export function parseFilesResponse(text: string): {
  summary: string;
  files: FileChange[];
} {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced
    ? fenced[1]
    : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const parsed = JSON.parse(raw) as { summary?: string; files?: FileChange[] };

  if (!Array.isArray(parsed.files))
    throw new Error("agent response has no files[]");
  return { summary: parsed.summary ?? "", files: parsed.files };
}
