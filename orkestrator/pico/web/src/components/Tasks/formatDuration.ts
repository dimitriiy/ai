export function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  if (ms < 1000) return `${ms}мс`

  const totalSeconds = Math.round(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}ч ${minutes}м`
  if (minutes > 0) return `${minutes}м ${seconds}с`
  return `${seconds}с`
}

export function sumStagesDurationMs(
  stages: { durationMs: number | null }[],
): number {
  return stages.reduce((acc, cur) => acc + (cur.durationMs ?? 0), 0)
}

export function formatTokens(total: number): string {
  if (!total) return '0'
  if (total < 1000) return String(total)
  return `${(total / 1000).toFixed(1)}k`
}

export function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)}`
}

export function formatTime(tsMs: number): string {
  const d = new Date(tsMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
