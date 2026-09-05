import { Octokit } from "@octokit/rest";
import { config, repoName, repoOwner } from "./config";
export const octokit = new Octokit({ auth: config.githubToken });

export interface IssueSummary {
  number: number;
  title: string;
  body: string;
}

export async function listTaskIssues(): Promise<IssueSummary[]> {
  const response = await octokit.issues.listForRepo({
    repo: repoName,
    owner: repoOwner,

    state: "open",
    labels: config.issueLabel,
    per_page: 50,
  });

  return response.data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      body: issue.body ?? "",
    }));
}

export async function commentOnIssue(
  issueNumber: number,
  body: string,
): Promise<void> {
  await octokit.issues.createComment({
    owner: repoOwner,
    repo: repoName,
    issue_number: issueNumber,
    body,
  });
}

import { upsertTask } from "./state";

export async function syncIssues(): Promise<number> {
  const issues = await listTaskIssues();

  issues.forEach(({ title, body, number }) => {
    upsertTask({
      issueBody: body,
      issueTitle: title,
      issueNumber: number,
    });
  });

  return issues.length;
}
