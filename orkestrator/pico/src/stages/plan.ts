import type { Task } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PlanResult {
  text: string;
  needsHuman: boolean;
}

export async function run(task: Task): Promise<PlanResult> {
  await delay(3500); // 0-1.5s

  const isComplex =
    task.issueTitle.toLowerCase().includes("complex") ||
    task.issueTitle.toLowerCase().includes("refactor");

  return {
    text: `Mock plan for: ${task.issueTitle}
    
1. Analyze existing code structure
2. Implement necessary changes
3. Add tests
4. Update documentation
    
Estimated complexity: ${isComplex ? "High" : "Medium"}`,
    needsHuman: isComplex,
  };
}
