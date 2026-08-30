import type { Task } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface FetchResult {
  issueData: {
    title: string;
    body: string;
    labels: string[];
    author: string;
  };
  comments: Array<{
    author: string;
    body: string;
    createdAt: string;
  }>;
}

export async function run(task: Task): Promise<FetchResult> {
  await delay(5000); // 0-2s

  return {
    issueData: {
      title: task.issueTitle || "Mock Issue Title",
      body: task.issueBody || "Mock issue body content",
      labels: ["enhancement", "good-first-issue"],
      author: "mock-user",
    },
    comments: [
      {
        author: "reviewer",
        body: "This looks good to me",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
