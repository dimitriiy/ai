import type { Task } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ImplementResult {
  summary: string;
  written: string[];
}

export async function run(
  task: Task,
  plan: string,
  lastFailure: string = "",
): Promise<ImplementResult> {
  await delay(4000); // 0-4s

  const mockFiles = [];
  if (task.issueTitle.toLowerCase().includes("test")) {
    mockFiles.push("tests/new-test.spec.ts");
  }
  if (task.issueTitle.toLowerCase().includes("api")) {
    mockFiles.push("src/api/endpoint.ts");
  }
  mockFiles.push("src/main.ts", "README.md");

  return {
    summary: `Mock implementation for: ${task.issueTitle}
    
Changes made:
- Fixed core logic
- Added error handling  
- Updated tests
${lastFailure ? `- Fixed previous failure: ${lastFailure.slice(0, 100)}...` : ""}`,
    written: mockFiles,
  };
}
