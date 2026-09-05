export type Stage =
  | 'fetch'
  | 'context'
  | 'plan'
  | 'implement'
  | 'verify'
  | 'pr'
  | 'done'
  | 'failed'

export type TaskStatus = 'pending' | 'running' | 'done' | 'blocked' | 'failed'

export type StageStatus = 'pending' | 'running' | 'done' | 'failed'

export type EventKind =
  | 'stage_started'
  | 'stage_finished'
  | 'stage_failed'
  | 'agent_text'
  | 'agent_tool'
  | 'blocked'

export interface Task {
  id: number
  issueNumber: number
  issueTitle: string
  issueBody: string
  status: TaskStatus
  stage: Stage
  attempts: number
  createdAt: string
  updatedAt: string

  prUrl?: string | null
  branch?: string | null
  worktreePath?: string | null
}

export interface TaskEvent {
  seq: number
  taskId: number
  stage: Stage
  kind: EventKind
  tsMs: number
  payload: Record<string, unknown>
}

export interface StageView {
  stage: Stage
  status: StageStatus
  durationMs: number | null
  costUsd: number | null
  tokensIn: number | null
  tokensOut: number | null
  modelName: string | null
}

export interface TaskView extends Task {
  stages: StageView[]
  events?: TaskEvent[]
  totalCostUsd: number
  tokensInTotal: number
  tokensOutTotal: number
  modelName: string | null
}

/** Порядок стадий — зеркалит PIPELINE из src/types.ts на бэке. */
export const PIPELINE: Stage[] = [
  'fetch',
  'context',
  'plan',
  'implement',
  'verify',
  'pr',
]

export const STAGE_TITLE: Record<string, string> = {
  fetch: 'Забрать issue',
  context: 'Собрать контекст',
  plan: 'Спланировать',
  implement: 'Реализовать',
  verify: 'Проверить',
  pr: 'Открыть PR',
}
