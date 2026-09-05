import { useQuery } from '@tanstack/react-query'
import { getRepo } from '../api'
import type { RepoInfo } from '../api'

interface State {
  repo: RepoInfo | null
  loading: boolean
  error: Error | null
}

export function useRepo(): State {
  const { data, isLoading, error } = useQuery({
    queryKey: ['repo'],
    queryFn: getRepo,
  })

  return {
    repo: data ?? null,
    loading: isLoading,
    error: error as Error | null,
  }
}
