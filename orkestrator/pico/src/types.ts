export type Stage =
  | "fetch"
  // | "context"
  | "plan"
  | "implement"
  | "verify"
  | "pr"
  | "done"
  | "failed";

export type TaskStatus = "pending" | "running" | "done" | "blocked" | "failed";

export type EventKind =
  | "stage_started"
  | "stage_finished"
  | "stage_failed"
  | "agent_text"
  | "agent_tool"
  | "blocked";

export interface Task {
  id: number;
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
  status: TaskStatus;
  stage: Stage;
  attempts: number;
  createdAt: string;
  updatedAt: string;

  prUrl?: string | null;
  branch?: string | null;
  worktreePath?: string | null;
}

export interface TaskEvent {
  seq: number;
  taskId: number;
  stage: Stage;
  kind: EventKind;
  tsMs: number;
  payload: Record<string, unknown>;
}

export const PIPELINE: Stage[] = [
  "fetch",
  // "context",
  "plan",
  "implement",
  "verify",
  "pr",
];

export const nextStage = (stage: Stage) => {
  const i = PIPELINE.indexOf(stage);
  if (i === -1) return null; // done / failed — терминальные

  return PIPELINE[i + 1] ?? "done";
};
