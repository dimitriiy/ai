import { PIPELINE, type Stage, type Task, type TaskEvent } from "./types";

export interface StageView {
  stage: Stage;
  status: "pending" | "running" | "done" | "failed";
  durationMs: number | null; // null, пока стадия не завершилась
  costUsd: number | null; // сумма по всем попыткам стадии; null, если агент не отчитался
  tokensIn: number | null;
  tokensOut: number | null;
  modelName: string | null; // модель, которой агент выполнял последнюю попытку стадии
}

export interface TaskView extends Task {
  stages: StageView[];
  events?: TaskEvent[];
  totalCostUsd: number;
  tokensInTotal: number;
  tokensOutTotal: number;
  modelName: string | null; // модель последнего агентского вызова по задаче
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Строит вид стадий проходом по событиям в хронологическом порядке.
 *
 * Важно идти по порядку, а не искать "первое" stage_finished/stage_started:
 * implement может выполняться несколько попыток (retry-цикл в pipeline.ts),
 * и на каждую попытку пишется своя пара started/finished с тем же stage —
 * статус и длительность должны отражать последнее событие, а cost/tokens
 * суммируются по всем попыткам.
 */
export function projectStages(events: TaskEvent[]): StageView[] {
  const byStage = new Map<Stage, StageView>();
  for (const stage of PIPELINE) {
    byStage.set(stage, {
      stage,
      status: "pending",
      durationMs: null,
      costUsd: null,
      tokensIn: null,
      tokensOut: null,
      modelName: null,
    });
  }

  for (const e of events) {
    const view = byStage.get(e.stage);
    if (!view) continue;

    if (e.kind === "stage_started") {
      view.status = "running";
    } else if (e.kind === "stage_finished") {
      view.status = "done";
      view.durationMs = num(e.payload.durationMs) ?? view.durationMs;

      const costUsd = num(e.payload.costUsd);
      if (costUsd !== null) view.costUsd = (view.costUsd ?? 0) + costUsd;

      const tokensIn = num(e.payload.tokensIn);
      if (tokensIn !== null) view.tokensIn = (view.tokensIn ?? 0) + tokensIn;

      const tokensOut = num(e.payload.tokensOut);
      if (tokensOut !== null)
        view.tokensOut = (view.tokensOut ?? 0) + tokensOut;

      const modelName = str(e.payload.modelName);
      if (modelName !== null) view.modelName = modelName;
    } else if (e.kind === "stage_failed") {
      view.status = "failed";
      view.durationMs = num(e.payload.durationMs) ?? view.durationMs;
    }
  }

  return PIPELINE.map((stage) => byStage.get(stage)!);
}

export function projectTask(
  task: Task,
  events: TaskEvent[],
  withEvents: boolean,
): TaskView {
  let totalCostUsd = 0;
  let tokensInTotal = 0;
  let tokensOutTotal = 0;
  let modelName: string | null = null;

  for (const e of events) {
    if (e.kind !== "stage_finished") continue;

    const costUsd = num(e.payload.costUsd);
    if (costUsd !== null) totalCostUsd += costUsd;

    const tokensIn = num(e.payload.tokensIn);
    if (tokensIn !== null) tokensInTotal += tokensIn;

    const tokensOut = num(e.payload.tokensOut);
    if (tokensOut !== null) tokensOutTotal += tokensOut;

    // события идут в хронологическом порядке — последний известный
    // modelName и есть модель, которой сейчас/последней работала задача.
    const eventModelName = str(e.payload.modelName);
    if (eventModelName !== null) modelName = eventModelName;
  }

  return {
    ...task,
    stages: projectStages(events),
    events: withEvents ? events.slice(-200) : undefined,
    totalCostUsd,
    tokensInTotal,
    tokensOutTotal,
    modelName,
  };
}
