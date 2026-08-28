import type { Task } from "../types";

export interface PlanResult {
  text: string;
  needsHuman: boolean;
}

export async function run(task: Task): Promise<PlanResult>;
