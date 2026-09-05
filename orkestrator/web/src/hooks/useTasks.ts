import { useQuery } from '@tanstack/react-query'
import { getTasks } from '../api'
import type { TaskView } from '@/types'

interface State {
  tasks: TaskView[]
  loading: boolean
  error: Error | null
}

export function useTasks(): State {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    refetchInterval: 3000,
  })

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: error as Error | null,
  }
}
