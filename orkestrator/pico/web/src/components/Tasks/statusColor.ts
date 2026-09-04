import type { StageStatus, TaskStatus } from '@/types'

type AnyStatus = TaskStatus | StageStatus | string

/** Mantine-цвет статуса: 'green' | 'yellow' | ... — для color-пропсов. */
export function statusColorName(status: AnyStatus): string {
  switch (status) {
    case 'done':
      return 'green'
    case 'running':
      return 'yellow'
    case 'failed':
      return 'red'
    case 'blocked':
      return 'orange'
    case 'pending':
    default:
      return 'gray'
  }
}

/** CSS-значение того же цвета — для style/backgroundColor. */
export function getStatusColor(status: AnyStatus): string {
  switch (status) {
    case 'done':
      return 'var(--mantine-color-green-6)'
    case 'running':
      return 'var(--mantine-color-yellow-4)'
    case 'failed':
      return 'var(--mantine-color-red-6)'
    case 'blocked':
      return 'var(--mantine-color-orange-5)'
    case 'pending':
    default:
      return 'var(--mantine-color-dark-3)'
  }
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'PENDING',
  running: 'RUNNING',
  done: 'DONE',
  blocked: 'BLOCKED',
  failed: 'FAILED',
}
