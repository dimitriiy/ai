import fs from "fs";
import { config, repoName, repoOwner } from "./config";
import { run } from "./shell";
import path from "path";
import { CliAgent } from "./agents/cli";
import { getTask } from "./state";

export async function worktreeTest() {
  const agent = new CliAgent();

  agent.apply(getTask(1), "orkestrator/pico/worktrees/_base");
}

const basePath = path.join(config.worktreeRoot, "_base");

export async function ensureBaseRepo(): Promise<string> {
  fs.mkdirSync(config.worktreeRoot, { recursive: true });

  if (!fs.existsSync(basePath)) {
    const url = `https://github.com/${repoOwner}/${repoName}.git`;

    await run("git", ["clone", url, basePath]);
  }

  await run("git", ["fetch", "origin"], { cwd: basePath });
  await run("git", ["checkout", config.baseBranch], { cwd: basePath });
  await run("git", ["reset", "--hard", `origin/${config.baseBranch}`], {
    cwd: basePath,
  });

  return basePath;
}

export async function createWorktree(
  taskId: number,
): Promise<{ path: string; branch: string }> {
  await ensureBaseRepo();

  const worktreePath = path.join(config.worktreeRoot, `task-${taskId}`);
  const branch = `pico/task-${taskId}`;

  if (fs.existsSync(worktreePath)) await removeWorktree(worktreePath);

  await run("git", ["branch", "-D", branch], {
    cwd: basePath,
    allowFailure: true,
  });

  await run(
    "git",
    ["worktree", "add", "-b", branch, worktreePath, config.baseBranch],
    {
      cwd: basePath,
    },
  );

  return {
    path: worktreePath,
    branch,
  };
}

export async function removeWorktree(worktreePath: string): Promise<void> {
  await run("git", ["worktree", "remove", "--force", worktreePath], {
    cwd: basePath,
    allowFailure: true,
  });

  await run("git", ["worktree", "prune"], {
    cwd: basePath,
    allowFailure: true,
  });

  if (fs.existsSync(worktreePath)) {
    fs.rmSync(worktreePath, { recursive: true, force: true });
  }
}
