import { useEffect, useState } from 'react'

export interface TaskEvent {
  id: string
  type?: string
  stage?: string
  status?: string
  message?: string
  [key: string]: unknown
}

export function useTaskEvents(url: string): Record<string, TaskEvent> {
  const [events, setEvents] = useState<Record<string, TaskEvent>>({})

  useEffect(() => {
    const evtSource = new EventSource(url)

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as TaskEvent
        if (data?.id == null) return
        setEvents((prev) => ({ ...prev, [data.id]: data }))
      } catch {
        // ignore malformed frames
      }
    }

    evtSource.addEventListener('message', onMessage)

    return () => {
      evtSource.removeEventListener('message', onMessage)
      evtSource.close()
    }
  }, [url])

  return events
}
