import type { Task } from "../types";

export interface ImplementResult {
  summary: string;
  written: string[];
}

export async function run(
  task: Task,
  plan: string,
  lastFailure: string,
): Promise<ImplementResult>;
