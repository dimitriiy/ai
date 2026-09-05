import { Task } from "./types";
import * as fetch from "./stages/fetch";
import * as plan from "./stages/plan";
import * as context from "./stages/context";

import * as implement from "./stages/implement";
import * as verify from "./stages/verify";
import * as pr from "./stages/pr";
import { recordEvent, withStage } from "./events";
import { getStageResult, saveStageResult, updateTask } from "./state";
import { config } from "./config";
import { createWorktree, removeWorktree } from "./worktree";

const STAGES = [
  "fetch",
  "context",
  "plan",
  "implement",
  "verify",
  "pr",
] as const;
type Stage = (typeof STAGES)[number];

const PRE_IMPLEMENT: Stage[] = ["fetch", "context", "plan"];

export async function runTask(taskInput: Task): Promise<void> {
  let task = taskInput;
  let current: Stage = task.stage as Stage;

  try {
    await once(task, "fetch", 0, () => fetch.run(task));

    if (!task.worktreePath) {
      const wt = await createWorktree(task.id);
      updateTask(task.id, { worktreePath: wt.path, branch: wt.branch });
      task = { ...task, worktreePath: wt.path, branch: wt.branch };
    }
    current = "context";

    const ctx = await once(task, "context", 0, () => context.run(task));

    current = "plan";
    const planResult = await once(task, "plan", 0, () => plan.run(task, ctx));

    if (planResult.needsHuman) {
      recordEvent(task.id, "plan", "blocked", { questions: planResult.text });
      updateTask(task.id, { stage: "plan", status: "blocked" });

      return;
    }

    let verification = { passed: false, report: "" };
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      current = "implement";
      const implementResult = await once(task, "implement", attempt, () =>
        implement.run(
          task,
          task.worktreePath!,
          planResult.text,
          verification.report,
        ),
      );

      current = "verify";
      verification = await once(task, "verify", attempt, () =>
        verify.run(task, implementResult),
      );

      if (verification.passed) {
        break;
      }

      if (attempt === config.maxAttempts) {
        throw new Error(
          `verify failed after ${attempt} attempts: ${verification.report}`,
        );
      }
    }

    current = "pr";

    const prData = await once(task, "pr", 0, () =>
      pr.run(task, task.worktreePath!, task.branch!, verification.report),
    );

    updateTask(task.id, { stage: "done", status: "done", prUrl: prData.url });
    await removeWorktree(task.worktreePath!);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (PRE_IMPLEMENT.includes(current)) {
      // Инфраструктурный сбой до первой записи в worktree — вернуть в очередь.
      updateTask(task.id, { status: "pending", stage: "fetch" });
    } else {
      updateTask(task.id, { stage: current, status: "failed" });
    }

    console.error(`task ${task.id} stopped at ${current}: ${message}`, err);
  }
}

async function once<T>(
  task: Task,
  stage: Stage,
  attempt: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cache = await getStageResult(task.id, stage, attempt);

  if (cache) {
    return cache as T;
  }
  updateTask(task.id, { stage, status: "running" });

  const result = await withStage(task.id, stage, fn);

  saveStageResult(task.id, stage, result, attempt);

  return result;
}
