import { db } from "./db";
import type { EventKind, Stage, Task } from "./types";

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

interface AgentMetaLike {
  modelName?: string;
  totalCostUsd?: number;
  totalInputTokens?: number;
  totalOutputTokens?: number;
}

/** Достаёт `agentMeta`, если результат стадии его несёт (plan/implement). */
function extractAgentMeta(output: unknown): AgentMetaLike | undefined {
  if (output && typeof output === "object" && "agentMeta" in output) {
    return (output as { agentMeta?: AgentMetaLike }).agentMeta;
  }
  return undefined;
}

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
    const agentMeta = extractAgentMeta(output);

    recordEvent(taskId, stage, "stage_finished", {
      durationMs,
      output,
      modelName: agentMeta?.modelName,
      costUsd: agentMeta?.totalCostUsd,
      tokensIn: agentMeta?.totalInputTokens,
      tokensOut: agentMeta?.totalOutputTokens,
    });

    return output;
  } catch (err) {
    recordEvent(taskId, stage, "stage_failed", {
      durationMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    });

    throw err;
  }
};
