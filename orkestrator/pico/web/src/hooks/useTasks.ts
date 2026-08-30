import { useEffect, useState } from 'react'
import { getTasks, type Task } from '../api'

interface State {
  tasks: Task[]
  loading: boolean
  error: Error | null
}

export function useTasks(): State {
  const [state, setState] = useState<State>({
    tasks: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))

    getTasks()
      .then((tasks) => {
        if (active) setState({ tasks, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (active) setState({ tasks: [], loading: false, error })
      })

    return () => {
      active = false
    }
  }, [])

  return state
}
