import type { Task } from "./types";

export async function runTask(task: Task): Promise<void> {}

async function once<T>(
  task: Task,
  stage: Stage,
  attempt: number,
  fn: () => Promise<T>,
): Promise<T> {}
