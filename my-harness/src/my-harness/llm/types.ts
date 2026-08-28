import type Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "../types";

export interface LLMResponse {
  content: Anthropic.Messages.ContentBlock[];
  stopReason: string | null;
  text: string | null;
}

export interface LLMClient {
  sendMessage(
    messages: ChatMessage[],
    tools: Anthropic.Messages.Tool[],
    systemPrompt: string,
  ): Promise<LLMResponse>;
}
