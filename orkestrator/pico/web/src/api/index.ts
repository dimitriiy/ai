import type { TaskView } from '@/types'

export const getTasks = async (): Promise<TaskView[]> => {
  const res = await fetch('/api/tasks')
  if (!res.ok) throw new Error(`getTasks failed: ${res.status}`)

  return res.json()
}

export const getTask = async (id: number | string): Promise<TaskView> => {
  const res = await fetch(`/api/tasks/${id}`)
  if (!res.ok) throw new Error(`getTask failed: ${res.status}`)

  return res.json()
}

export const runTask = async (id: number | string): Promise<void> => {
  const res = await fetch(`/api/tasks/${id}/run`, { method: 'POST' })
  if (!res.ok) throw new Error(`runTask failed: ${res.status}`)
}

export const resumeTask = async (id: number | string): Promise<TaskView> => {
  const res = await fetch(`/api/tasks/${id}/resume`, { method: 'POST' })
  if (!res.ok) throw new Error(`resumeTask failed: ${res.status}`)

  return res.json()
}

export const clearAllTasks = async (): Promise<void> => {
  const res = await fetch('/api/tasks/clear-all', { method: 'POST' })
  if (!res.ok) throw new Error(`clearAllTasks failed: ${res.status}`)
}

export const syncIssues = async (): Promise<{ synced: number }> => {
  const res = await fetch('/api/fetch', { method: 'POST' })
  if (!res.ok) throw new Error(`syncIssues failed: ${res.status}`)

  return res.json()
}

export interface RepoInfo {
  owner: string
  name: string
  fullName: string
}

export const getRepo = async (): Promise<RepoInfo> => {
  const res = await fetch('/api/repo')
  if (!res.ok) throw new Error(`getRepo failed: ${res.status}`)

  return res.json()
}
