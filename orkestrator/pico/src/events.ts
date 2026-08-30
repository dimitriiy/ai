// src/events.ts: recordEvent(taskId, stage, kind, payload) — выдаёт seq как MAX+1 с повтором при конфликте;
//  readEvents(taskId, afterSeq?) — читает по возрастанию seq.
// Там же — withStage(taskId, stage, fn): пишет stage_started, выполняет fn, пишет stage_finished с durationMs и результатом.
// Если fn бросил — пишет stage_failed с текстом ошибки и пробрасывает исключение дальше.
// Последнее важно: обёртка логирует, но не проглатывает. Решение о том, что делать с ошибкой, принимает оркестратор.

import { stringify } from "querystring";
import { db } from "./db";
import type { EventKind, Stage, Task } from "./types";

// Внутри recordEvent: seq вычисляется как MAX(seq) + 1 среди событий этой задачи,
//  и вставка идёт в цикле — поймал нарушение UNIQUE, перечитал максимум, попробовал снова.
//  payload уходит в базу через JSON.stringify, а readEvents возвращает его уже распакованным объектом, не строкой.

export const recordEvent = (
  taskId: Task["id"],
  stage: Stage,
  kind: EventKind,
  payload?: Record<string, unknown>,
): number => {
  const json = JSON.stringify(payload);
  const tsMs = Date.now();

  for (;;) {
    try {
      const { next } = db
        .prepare(
          "SELECT COALESCE(MAX(seq), 0) + 1 AS next FROM task_events WHERE task_id = ?",
        )
        .get(taskId) as { next: number };

      db.prepare(
        `INSERT INTO task_events (task_id, seq, stage, kind, ts_ms, payload)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(taskId, next, stage, kind, tsMs, json);
      return next;
    } catch (err) {
      if (!String(err).includes("UNIQUE")) throw err;
    }
  }
};

export const readEvents = (taskId: number, afterSeq = 0) => {
  const rows = db
    .prepare(
      `SELECT seq, task_id, stage, kind, ts_ms, payload
         FROM task_events
        WHERE task_id = ? AND seq > ?
        ORDER BY seq ASC`,
    )
    .all(taskId, afterSeq) as Array<{
    seq: number;
    task_id: number;
    stage: string;
    kind: string;
    ts_ms: number;
    payload: string;
  }>;

  return rows.map((r) => ({
    seq: r.seq,
    taskId: r.task_id,
    stage: r.stage as Stage,
    kind: r.kind as EventKind,
    tsMs: r.ts_ms,
    payload: JSON.parse(r.payload) as Record<string, unknown>,
  }));
};

// Там же — обёртка стадии:
// export async function withStage<T>(
//   taskId: number,
//   stage: Stage,
//   fn: () => Promise<T>,               // тело стадии
//   input?: Record<string, unknown>,     // попадёт в payload события stage_started
// ): Promise<T>;                         // ровно то, что вернул fn
// Порядок действий: пишем stage_started с
//  { input } → засекаем время → выполняем fn → пишем stage_finished
//  с { durationMs, output } → возвращаем результат. Если fn бросил —
//  вместо этого stage_failed с { durationMs, error }, где error — текст сообщения, и исключение летит дальше.

// Дженерик <T> тут не украшение: он делает обёртку прозрачной по типам.

// withStage(1, "plan", async () => ({ text: "..." })) вернёт { text: string }, а не unknown, и вызывающий код ничего не потеряет.

// Последнее важно: обёртка логирует, но не проглатывает. Решение о том, что делать с ошибкой, принимает оркестратор.

export const withStage = async <T>(
  taskId: number,
  stage: Stage,
  fn: () => Promise<T>,
  input?: Record<string, unknown>,
): Promise<T> => {
  const startedAt = Date.now();

  try {
    recordEvent(taskId, stage, "stage_started", { input });

    const output = await fn();

    const durationMs = Date.now() - startedAt;

    recordEvent(taskId, stage, "stage_finished", { durationMs, output });

    return output;
  } catch (err) {
    recordEvent(taskId, stage, "stage_failed", {
      durationMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    });

    throw err;
  }
};
