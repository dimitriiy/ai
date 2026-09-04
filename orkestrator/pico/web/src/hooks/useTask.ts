import { useQuery } from '@tanstack/react-query'
import { getTask } from '../api'
import type { TaskView } from '@/types'

interface State {
  task: TaskView | null
  loading: boolean
  error: Error | null
}

export function useTask(id: number | string | null): State {
  const { data, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTask(id!),
    enabled: id != null,
  })

  return {
    task: data ?? null,
    loading: id != null && isLoading,
    error: error as Error | null,
  }
}
