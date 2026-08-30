import type { Task } from '../components/Tasks/types'

export const mockTasks: Task[] = [
  {
    id: '1',
    number: 23,
    title: 'Hide task cost in dollars',
    repository: 'podlodka-ai-club/the-foundry',
    status: 'done',
    stages: 6,
    completedStages: 6,
    duration: '3m 33s',
    tokens: '379.4k',
  },
  {
    id: '2',
    number: 21,
    title: 'Token accounting',
    repository: 'podlodka-ai-club/the-foundry',
    status: 'done',
    stages: 6,
    completedStages: 6,
    duration: '4m 42s',
    tokens: '1111.9k',
    attempts: 4,
  },
]
