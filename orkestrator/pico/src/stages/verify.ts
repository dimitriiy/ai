import type { Task } from "../types";
import type { ImplementResult } from "./implement";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface VerifyResult {
  passed: boolean;
  report: string;
}

export async function run(
  task: Task,
  impl: ImplementResult,
): Promise<VerifyResult> {
  await delay(Math.random() * 2500); // 0-2.5s
  
  const passed = Math.random() > 0.2; // 80% pass rate
  
  return {
    passed,
    report: `Mock verification report:

Files checked: ${impl.written.join(", ")}
    
${passed ? 
  "✓ All tests passed\n✓ Code quality checks passed\n✓ No security issues" :
  "✗ Test failure in test suite\n✗ Lint errors found\n→ Need fixes before merge"
}

Summary: ${impl.summary}`,
  };
};
