import { useEffect, useState } from 'react'
import { getTask, type Task } from '../api'

interface State {
  task: Task | null
  loading: boolean
  error: Error | null
}

export function useTask(id: number | string | null): State {
  const [state, setState] = useState<State>({
    task: null,
    loading: id != null,
    error: null,
  })

  useEffect(() => {
    if (id == null) {
      setState({ task: null, loading: false, error: null })
      return
    }

    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))

    getTask(id)
      .then((task) => {
        if (active) setState({ task, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (active) setState({ task: null, loading: false, error })
      })

    return () => {
      active = false
    }
  }, [id])

  return state
}
