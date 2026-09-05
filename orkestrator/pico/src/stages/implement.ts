import { callAgent } from "../agent";
import type { AgentMeta } from "../agent";
import { run as sh } from "../shell";
import type { Task } from "../types";

export interface ImplementResult {
  summary: string; // что агент сказал про свою правку
  written: string[]; // относительные пути файлов, которые он переписал
  agentMeta?: AgentMeta;
}

export async function run(
  task: Task,
  worktreePath: string,
  plan: string, // текст плана из стадии plan
  previousReport: string, // отчёт провалившейся попытки; "" на первой
): Promise<ImplementResult> {
  const input = [
    "## План\n" + plan,
    previousReport
      ? "\n## Прошлая попытка провалилась\n" + previousReport
      : "",
  ].join("\n");

  const { response, meta } = await callAgent(
    "implement",
    task,
    worktreePath,
    input,
  );
  const written = await changedFiles(worktreePath);

  return { summary: response, written, agentMeta: meta };
}

/** Пути файлов, изменённых агентом в worktree, по `git status --porcelain`. */
async function changedFiles(worktreePath: string): Promise<string[]> {
  const status = await sh("git", ["status", "--porcelain"], {
    cwd: worktreePath,
  });

  return status.stdout
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.slice(3).trim());
}
