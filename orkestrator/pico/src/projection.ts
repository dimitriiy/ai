import { PIPELINE, type Stage, type Task, type TaskEvent } from "./types";

export interface StageView {
  stage: Stage;
  status: "pending" | "running" | "done" | "failed";
  durationMs: number | null; // null, пока стадия не завершилась
}

export interface TaskView extends Task {
  stages: StageView[];
  events?: TaskEvent[];
}

export function projectStages(events: TaskEvent[]): StageView[] {
  return PIPELINE.map((stage) => {
    const own = events.filter((e) => e.stage === stage);
    const finished = own.find((e) => e.kind === "stage_finished");
    const failed = own.find((e) => e.kind === "stage_failed");
    const started = own.find((e) => e.kind === "stage_started");

    const terminal = failed ?? finished;
    const status = failed
      ? "failed"
      : finished
        ? "done"
        : started
          ? "running"
          : "pending";

    return {
      stage,
      status,
      durationMs: terminal ? Number(terminal.payload.durationMs ?? 0) : null,
    };
  });
}

export function projectTask(
  task: Task,
  events: TaskEvent[],
  withEvents: boolean,
): TaskView {
  return {
    ...task,
    stages: projectStages(events),
    events: withEvents ? events.slice(-200) : undefined,
  };
}
