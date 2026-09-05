import { config, repoOwner, repoName } from "../config";
import { commentOnIssue, octokit } from "../github";
import { run as sh } from "../shell";
import type { Task } from "../types";

const MAX_FILES = 40;

export interface PrResult {
  url: string;
  number: number;
  files: number;
}

export async function run(
  task: Task,
  worktreePath: string,
  branch: string, // pico/task-{id}, из задачи
  report: string, // отчёт верификации — уедет в тело PR
): Promise<PrResult> {
  const status = await sh("git", ["status", "--porcelain"], {
    cwd: worktreePath,
  });
  const changed = status.stdout.split("\n").filter((line) => line.trim());

  if (changed.length === 0) {
    throw new Error("nothing to commit");
  }
  if (changed.length > MAX_FILES) {
    throw new Error(
      `refusing to commit ${changed.length} files (limit ${MAX_FILES})`,
    );
  }

  await sh("git", ["add", "-A"], { cwd: worktreePath });
  await sh(
    "git",
    [
      "-c",
      "user.name=Pico Foundry",
      "-c",
      "user.email=pico-foundry@localhost",
      "commit",
      "-m",
      `pico: ${task.issueTitle} (#${task.issueNumber})`,
    ],
    { cwd: worktreePath },
  );
  await sh("git", ["push", "-u", "origin", branch], { cwd: worktreePath });

  const { data: pr } = await octokit.pulls.create({
    owner: repoOwner,
    repo: repoName,
    head: branch,
    base: config.baseBranch,
    title: `${task.issueTitle} (#${task.issueNumber})`,
    body: [
      `Closes #${task.issueNumber}`,
      "",
      "## Верификация",
      report.trim() || "—",
    ].join("\n"),
  });

  await commentOnIssue(task.issueNumber, `Готово: ${pr.html_url}`);

  return { url: pr.html_url, number: pr.number, files: changed.length };
}
