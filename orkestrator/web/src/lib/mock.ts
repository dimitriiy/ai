// Данные, которых бэкенд пока не отдаёт. Всё в одном файле, чтобы удалить
// одним движением, когда появятся настоящие поля в TaskView / StageView.

import type { StageView, TaskView } from '@/types'

/** Репозиторий: на бэке он один и живёт в config.ts, наружу не выставлен. */
export const MOCK_REPO = 'mock-org/mock-repo'

export function issueUrl(task: TaskView): string {
  return `https://github.com/${MOCK_REPO}/issues/${task.issueNumber}`
}

/** Детерминированный псевдослучайный [0,1) — чтобы моки не прыгали на ререндере. */
function hashUnit(...parts: (string | number)[]): number {
  let h = 2166136261
  for (const part of parts) {
    const s = String(part)
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
  }
  return ((h >>> 0) % 100000) / 100000
}

export interface MockAgent {
  name: string
  model: string
}

const AGENT_BY_STAGE: Record<string, MockAgent> = {
  plan: { name: 'planner', model: 'claude-opus-5' },
  implement: { name: 'coder', model: 'claude-opus-5' },
  verify: { name: 'verifier', model: 'claude-sonnet-5' },
}

export function stageAgent(stage: string): MockAgent | null {
  return AGENT_BY_STAGE[stage] ?? null
}

/** Токены стадии — пропорциональны её длительности, чтобы выглядело живо. */
export function stageTokens(taskId: number, stage: StageView): number {
  if (stage.status === 'pending' || stage.durationMs === null) return 0
  const base = Math.round(stage.durationMs / 8)
  const jitter = 0.6 + hashUnit(taskId, stage.stage) * 0.8
  return Math.round(base * jitter)
}

export function taskTokens(task: TaskView): number {
  return task.stages.reduce((acc, s) => acc + stageTokens(task.id, s), 0)
}

/** $3 / 1M токенов — просто чтобы колонка не пустовала. */
export function tokensToUsd(tokens: number): number {
  return (tokens / 1_000_000) * 3
}
