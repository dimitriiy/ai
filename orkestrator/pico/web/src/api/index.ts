export type Stage =
  'fetch' | 'plan' | 'implement' | 'verify' | 'pr' | 'done' | 'failed'
export type TaskStatus = 'pending' | 'running' | 'done' | 'blocked' | 'failed'

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

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch('/api/tasks')
  if (!res.ok) throw new Error(`getTasks failed: ${res.status}`)

  return res.json()
}

export const getTask = async (id: number | string): Promise<Task> => {
  const res = await fetch(`/api/task/${id}`)
  if (!res.ok) throw new Error(`getTask failed: ${res.status}`)

  return res.json()
}

export const getTaskProject = async (id: number | string): Promise<any> => {
  const res = await fetch(`/api/task/${id}/projects`)
  if (!res.ok) throw new Error(`getTask failed: ${res.status}`)

  return res.json()
}

export const runTask = () => {}
