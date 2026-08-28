// Проверка пайплайна из модуля 04. Запуск: yarn tsx src/scratch.ts
// Шаг 1: задача проходит полный цикл до done, у каждой стадии пара started/finished.
// Шаг 2: откат в pending/verify и повторный прогон — fetch/plan/implement не должны
// выполниться заново (идемпотентность через stage_results).

import { db } from "./db";
import { getTask, upsertTask } from "./state";
import { readEvents } from "./events";
import { runTask } from "./pipeline";
import type { Stage } from "./types";

const ISSUE = 999901;
const STAGES: Stage[] = ["fetch", "plan", "implement", "verify", "pr"];

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error(`FAIL — ${msg}`);
    process.exit(1);
  }
  console.log(`ok — ${msg}`);
}

function stageKinds(taskId: number): string[] {
  return readEvents(taskId).map((e) => `${e.stage}:${e.kind}`);
}

function startedCount(taskId: number, stage: Stage): number {
  return stageKinds(taskId).filter((k) => k === `${stage}:stage_started`)
    .length;
}

// Чистим прошлые прогоны, иначе upsertTask переиспользует задачу со старыми событиями
function cleanup(): void {
  const rows = db
    .prepare("SELECT id FROM tasks WHERE issue_number = ?")
    .all(ISSUE) as Array<{ id: number }>;
  for (const { id } of rows) {
    db.prepare("DELETE FROM task_events WHERE task_id = ?").run(id);
    db.prepare("DELETE FROM stage_results WHERE task_id = ?").run(id);
  }
  db.prepare("DELETE FROM tasks WHERE issue_number = ?").run(ISSUE);
}

async function main(): Promise<void> {
  cleanup();

  const task = upsertTask({
    issueNumber: ISSUE,
    issueTitle: "scratch: pipeline check",
    issueBody: "проверка оркестратора из модуля 04",
  })!;
  console.log(`task #${task.id} создан`);

  // --- шаг 1: полный прогон ---
  await runTask(task);

  const done = getTask(task.id)!;
  assert(
    done.status === "done",
    `задача дошла до done (статус: ${done.status})`,
  );
  assert(!!done.prUrl, `prUrl заполнен (${done.prUrl})`);

  for (const stage of STAGES) {
    const own = stageKinds(task.id).filter((k) => k.startsWith(`${stage}:`));
    assert(
      own.includes(`${stage}:stage_started`) &&
        own.includes(`${stage}:stage_finished`),
      `${stage}: есть пара started/finished`,
    );
  }

  // --- шаг 2: идемпотентность ---
  const countsBefore = STAGES.map((s) => startedCount(task.id, s));
  db.prepare(
    "UPDATE tasks SET status = 'pending', stage = 'verify' WHERE id = ?",
  ).run(task.id);

  await runTask(getTask(task.id)!);

  const countsAfter = STAGES.map((s) => startedCount(task.id, s));
  for (let i = 0; i < STAGES.length; i++) {
    assert(
      countsAfter[i] === countsBefore[i],
      `${STAGES[i]}: повторный прогон не создал новых событий (${countsBefore[i]} → ${countsAfter[i]})`,
    );
  }

  const rerun = getTask(task.id)!;
  assert(
    rerun.status === "done",
    `после отката задача снова done (статус: ${rerun.status})`,
  );
}

main()
  .then(() => console.log("scratch: все проверки пройдены"))
  .catch((err: unknown) => {
    console.error("scratch: упал —", err);
    process.exit(1);
  });
