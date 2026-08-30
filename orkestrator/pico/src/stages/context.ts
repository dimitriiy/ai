import type { Task } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ContextResult {
  repoStructure: {
    files: string[];
    directories: string[];
    techStack: string[];
  };
  relevantCode: Array<{
    file: string;
    lines: number[];
    snippet: string;
  }>;
  dependencies: Record<string, string>;
}

export async function run(task: Task, issueData: any): Promise<ContextResult> {
  await delay(Math.random() * 3000); // 0-3s
  
  return {
    repoStructure: {
      files: [
        "src/main.ts",
        "src/types.ts", 
        "package.json",
        "README.md",
      ],
      directories: [
        "src/",
        "tests/",
        "docs/",
      ],
      techStack: ["TypeScript", "Node.js", "Jest"],
    },
    relevantCode: [
      {
        file: "src/main.ts",
        lines: [10, 15, 20],
        snippet: "// Mock code snippet for context",
      },
    ],
    dependencies: {
      "typescript": "^5.0.0",
      "jest": "^29.0.0",
    },
  };
}