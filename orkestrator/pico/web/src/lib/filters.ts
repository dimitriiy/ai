import type { TaskView } from '@/types'
import { MOCK_REPO } from './mock'

export type TaskFilter = 'all' | 'active' | 'blocked' | 'success' | 'failed'

export const TASK_FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'В работе' },
  { value: 'blocked', label: 'На паузе' },
  { value: 'success', label: 'Без ошибок' },
  { value: 'failed', label: 'С ошибкой' },
]

export function matchesFilter(task: TaskView, filter: TaskFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'active':
      return task.status === 'running' || task.status === 'pending'
    case 'blocked':
      return task.status === 'blocked'
    case 'success':
      return task.status === 'done'
    case 'failed':
      return task.status === 'failed'
  }
}

export function matchesSearch(task: TaskView, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return true

  const haystack = [
    String(task.issueNumber),
    `#${task.issueNumber}`,
    task.issueTitle,
    task.issueBody,
    task.status,
    task.stage,
    task.branch,
    task.worktreePath,
    task.prUrl,
    MOCK_REPO,
  ]

  return haystack.some((value) => value?.toLowerCase().includes(needle))
}

export function countByFilter(tasks: TaskView[]): Record<TaskFilter, number> {
  const counts: Record<TaskFilter, number> = {
    all: tasks.length,
    active: 0,
    blocked: 0,
    success: 0,
    failed: 0,
  }

  for (const task of tasks) {
    if (task.status === 'running' || task.status === 'pending') counts.active++
    if (task.status === 'blocked') counts.blocked++
    if (task.status === 'done') counts.success++
    if (task.status === 'failed') counts.failed++
  }

  return counts
}
