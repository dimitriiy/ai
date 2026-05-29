import Anthropic from "@anthropic-ai/sdk";
import type { LLMClient, LLMResponse } from "./types";
import type { ChatMessage } from "../types";
import { MODEL, MAX_TOKENS } from "../config";

export class AnthropicLLMClient implements LLMClient {
  private client: Anthropic;

  constructor(baseURL?: string, apiKey?: string) {
    this.client = new Anthropic({
      baseURL: baseURL ?? "http://localhost:11434",
      apiKey: apiKey ?? "ollama",
    });
  }

  async sendMessage(
    messages: ChatMessage[],
    tools: Anthropic.Messages.Tool[],
    systemPrompt: string,
  ): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      messages,
      system: systemPrompt,
      model: MODEL,
      max_tokens: MAX_TOKENS,
      tools,
    });

    const text =
      response.content
        ?.filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim() ?? null;

    return {
      content: response.content,
      stopReason: response.stop_reason,
      text,
    };
  }
}
