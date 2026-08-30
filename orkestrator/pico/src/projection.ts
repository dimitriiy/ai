import type { Stage, Task, TaskEvent } from "./types";

export interface StageView {
  stage: Stage;
  status: "pending" | "running" | "done" | "failed";
  durationMs: number | null; // null, пока стадия не завершилась
}

export interface TaskView extends Task {
  stages: StageView[];
  events?: TaskEvent[]; // только там, где их попросили
}

export function projectStages(events: TaskEvent[]): StageView[] {}

export function projectTask(
  task: Task,
  events: TaskEvent[],
  withEvents: boolean,
): TaskView {}
