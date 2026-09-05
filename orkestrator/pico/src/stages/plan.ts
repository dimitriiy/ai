import { callAgent } from "../agent";
import type { Task } from "../types";
import type { ContextResult } from "./context";

export interface PlanResult {
  text: string;
  needsHuman: boolean;
}

// run собирает контекст через buildContext,
//  зовёт callAgent("plan", task, context) и возвращает текст вместе с флагом.

export async function run(
  task: Task,
  context: ContextResult,
): Promise<PlanResult> {
  if (!task.worktreePath) {
    throw new Error("task.worktreePath is not defined in plan ");
  }

  const response = await callAgent(
    "plan",
    task,
    task.worktreePath,
    JSON.stringify(context),
  );

  console.log("response", response);

  return { text: stripMarker(response), needsHuman: needsHuman(response) };
}

/** true, если ПОСЛЕДНЯЯ непустая строка — это маркер. */
export function needsHuman(text: string): boolean {
  const last = text.split("\n").filter((l) => l.trim()).at(-1) ?? "";
  return /NEED_HUMAN/.test(last);
}

/** Тот же текст без строки-маркера — его и показываем человеку. */
export function stripMarker(text: string): string {
  return text
    .split("\n")
    .filter((l) => !/NEED_HUMAN/i.test(l.trim()))
    .join("\n")
    .trimEnd();
}
