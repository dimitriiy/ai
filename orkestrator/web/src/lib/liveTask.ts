// Накат событий из SSE поверх снапшота задачи.
//
// GET /api/tasks обновляется поллингом раз в 3 секунды, а поток событий идёт
// непрерывно. Без этого шага кружки стадий в строке дёргаются раз в три
// секунды, хотя данные уже пришли. Здесь снапшот и поток сводятся в один
// TaskView, из которого рендерится вся строка.

import type { Stage, StageView, TaskEvent, TaskView } from '@/types'
import { PIPELINE } from '@/types'

export interface StageDetail {
  /** Что стадия получила на вход (stage_started.payload.input). */
  input: unknown
  /** Что стадия вернула (stage_finished.payload.output). */
  output: unknown
  /** Текст ошибки (stage_failed.payload.error). */
  error: string | null
  /** Вопросы агента, если пайплайн встал на гейте (blocked.payload.questions). */
  questions: string | null
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Пересобирает stages из событий. Порядок ровно как в projectStages на бэке,
 * чтобы снапшот и живая проекция не расходились: failed > finished > started.
 */
export function projectLiveTask(task: TaskView, events: TaskEvent[]): TaskView {
  if (events.length === 0) return task

  const byStage = new Map<string, StageView>()
  for (const stage of task.stages) byStage.set(stage.stage, { ...stage })

  for (const stage of PIPELINE) {
    if (!byStage.has(stage)) {
      byStage.set(stage, {
        stage,
        status: 'pending',
        durationMs: null,
        costUsd: null,
        tokensIn: null,
        tokensOut: null,
        modelName: null,
      })
    }
  }

  let blocked = false

  for (const event of events) {
    const view = byStage.get(event.stage)
    if (!view) continue

    if (event.kind === 'stage_started' && view.status === 'pending') {
      view.status = 'running'
    }

    if (event.kind === 'stage_finished') {
      view.status = 'done'
      view.durationMs = num(event.payload.durationMs) ?? view.durationMs
      view.modelName = str(event.payload.modelName) ?? view.modelName
    }

    if (event.kind === 'stage_failed') {
      view.status = 'failed'
      view.durationMs = num(event.payload.durationMs) ?? view.durationMs
    }

    if (event.kind === 'blocked') blocked = true
  }

  const stages = PIPELINE.map(
    (stage) =>
      byStage.get(stage) ?? {
        stage,
        status: 'pending' as const,
        durationMs: null,
        costUsd: null,
        tokensIn: null,
        tokensOut: null,
        modelName: null,
      },
  )

  const running = stages.find((s) => s.status === 'running')
  const failed = stages.some((s) => s.status === 'failed')

  let status = task.status
  let currentStage = task.stage

  // Снапшот может отставать от потока на пару секунд — доверяем потоку,
  // но только пока он говорит о незавершённых состояниях.
  if (blocked) {
    status = 'blocked'
  } else if (failed && task.status !== 'done') {
    status = 'failed'
  } else if (running && task.status !== 'done') {
    status = 'running'
    currentStage = running.stage
  }

  // Модель задачи — последняя известная по стадиям (та, что реально работала
  // последней); падать обратно на снапшот, если поток ещё ничего не принёс.
  const modelName =
    [...stages].reverse().find((s) => s.modelName)?.modelName ?? task.modelName

  return { ...task, status, stage: currentStage, stages, events, modelName }
}

/** Достаёт вход/выход/ошибку конкретной стадии из ленты событий. */
export function stageDetail(events: TaskEvent[], stage: Stage): StageDetail {
  const detail: StageDetail = {
    input: undefined,
    output: undefined,
    error: null,
    questions: null,
  }

  for (const event of events) {
    if (event.stage !== stage) continue

    if (event.kind === 'stage_started' && 'input' in event.payload) {
      detail.input = event.payload.input
    }
    if (event.kind === 'stage_finished') {
      detail.output = event.payload.output
    }
    if (event.kind === 'stage_failed') {
      detail.error = String(event.payload.error ?? '')
    }
    if (event.kind === 'blocked') {
      detail.questions = String(event.payload.questions ?? '')
    }
  }

  return detail
}

/**
 * Стадия, которую логично показать сразу при разворачивании:
 * идущая сейчас > упавшая > последняя завершённая > первая.
 */
export function defaultStage(task: TaskView): Stage {
  const running = task.stages.find((s) => s.status === 'running')
  if (running) return running.stage

  const failed = task.stages.find((s) => s.status === 'failed')
  if (failed) return failed.stage

  const done = [...task.stages].reverse().find((s) => s.status === 'done')
  if (done) return done.stage

  return task.stages[0]?.stage ?? 'fetch'
}
