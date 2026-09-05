import type { Task } from "../types";
import { octokit } from "../github";
import { repoOwner, repoName } from "../config";

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
  const [issueResp, commentsResp] = await Promise.all([
    octokit.issues.get({
      owner: repoOwner,
      repo: repoName,
      issue_number: task.issueNumber,
    }),
    octokit.issues.listComments({
      owner: repoOwner,
      repo: repoName,
      issue_number: task.issueNumber,
    }),
  ]);

  const issue = issueResp.data;

  return {
    issueData: {
      title: issue.title,
      body: issue.body ?? "",
      labels: issue.labels.map((l) =>
        typeof l === "string" ? l : (l.name ?? ""),
      ),
      author: issue.user?.login ?? "unknown",
    },
    comments: commentsResp.data.map((c) => ({
      author: c.user?.login ?? "unknown",
      body: c.body ?? "",
      createdAt: c.created_at,
    })),
  };
}
