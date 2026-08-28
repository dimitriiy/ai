import type { Task } from "../types";
import type { ImplementResult } from "./implement";

export interface VerifyResult {
  passed: boolean;
  report: string;
}

export async function run(
  task: Task,
  impl: ImplementResult,
): Promise<VerifyResult>;
