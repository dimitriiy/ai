import type { Task } from "../types.js";

export type AgentStage = "plan" | "implement" | "verify";

export interface AgentResult {
  response: string; // финальный текст агента
  sessionId: string | null; // id сессии CLI; null у stub
}

export interface CodingAgent {
  name: string; // "stub" | "claude_cli" — попадает в события
  apply(
    task: Task,
    worktree: string, // рабочая директория агента
    input: string, // план, отчёт о провале и т.п.
    stage: AgentStage,
  ): Promise<AgentResult>;
}
