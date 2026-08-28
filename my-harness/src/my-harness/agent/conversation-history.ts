import type { ChatMessage } from "../types";
import { MAX_HISTORY_TURNS } from "../config";

export class ConversationHistory {
  private messages: ChatMessage[] = [];
  private maxTurns: number;

  constructor(maxTurns: number = MAX_HISTORY_TURNS) {
    this.maxTurns = maxTurns;
  }

  addUserMessage(content: string): void {
    this.messages.push({ role: "user", content });
    this.trim();
  }

  addAssistantMessage(content: ChatMessage["content"]): void {
    this.messages.push({ role: "assistant", content });
    this.trim();
  }

  addToolResults(results: Array<{ type: "tool_result"; content: string; tool_use_id: string }>): void {
    this.messages.push({ role: "user", content: results });
    this.trim();
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  private trim(): void {
    if (this.messages.length <= this.maxTurns) return;

    const start = this.messages.length - this.maxTurns;

    for (let i = start; i < this.messages.length; i++) {
      const message = this.messages[i];
      if (message.role === "user" && typeof message.content === "string") {
        this.messages = this.messages.slice(i);
        return;
      }
    }
  }
}
