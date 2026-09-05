import { useCallback, useEffect, useRef, useState } from 'react'
import type { EventKind, TaskEvent, TaskView } from '@/types'
import { useTask } from './useTask'

// Все виды событий из EventKind. У SSE поле `event:` — это наш kind, и
// именованные события идут мимо onmessage: на каждое имя нужен свой
// addEventListener. Забыть здесь одно имя = молча потерять его в ленте.
const KINDS: EventKind[] = [
  'stage_started',
  'stage_finished',
  'stage_failed',
  'agent_text',
  'agent_tool',
  'blocked',
]

interface Stream {
  task: TaskView | null // снапшот из GET /api/tasks/:id
  events: TaskEvent[] // отсортированы по seq
  connected: boolean // открыт ли SSE прямо сейчас
}

export function useTaskStream(taskId: number | null): Stream {
  const { task } = useTask(taskId)

  const [events, setEvents] = useState<TaskEvent[]>([])
  const [connected, setConnected] = useState(false)
  const seen = useRef(new Set<number>())

  const merge = useCallback((event: TaskEvent) => {
    if (seen.current.has(event.seq)) return
    seen.current.add(event.seq)
    setEvents((prev) => [...prev, event].sort((a, b) => a.seq - b.seq))
  }, [])

  // Смена задачи — чистый лист: seq нумеруются с 1 внутри каждой задачи,
  // так что чужие номера иначе схлопнут события новой задачи как «уже видели».
  useEffect(() => {
    seen.current = new Set()
    setEvents([])
    setConnected(false)
  }, [taskId])

  // Снапшот: события из GET /api/tasks/:id попадают в ленту сразу, не дожидаясь
  // SSE. Пересечение со стримом неизбежно — его отфильтрует merge по seq.
  useEffect(() => {
    if (task === null || task.id !== taskId) return
    task.events?.forEach(merge)
  }, [task, taskId, merge])

  useEffect(() => {
    if (taskId == null) return

    const source = new EventSource(`/api/tasks/${taskId}/events`)

    source.onopen = () => setConnected(true)
    // Не закрываем: браузер переподключится сам и подставит Last-Event-ID.
    source.onerror = () => setConnected(false)

    const handler = (e: MessageEvent<string>) => {
      try {
        merge(JSON.parse(e.data) as TaskEvent)
      } catch {
        // битый кадр — пропускаем, поток важнее одной строки
      }
    }

    for (const kind of KINDS) source.addEventListener(kind, handler)

    return () => {
      source.close()
      setConnected(false)
    }
  }, [taskId, merge])

  return {
    connected,
    task: task?.id === taskId ? task : null,
    events,
  }
}
