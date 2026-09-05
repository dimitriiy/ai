import { useEffect, useRef, useState } from 'react'
import {
  Anchor,
  Box,
  Code,
  Group,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconHandStop,
  IconMessage,
  IconTool,
} from '@tabler/icons-react'
import type { TaskEvent } from '@/types'
import { formatTime } from './formatDuration'

const PREVIEW_LIMIT = 220

function str(payload: Record<string, unknown>, key: string): string {
  const value = payload[key]
  return typeof value === 'string' ? value : ''
}

interface RowProps {
  icon: React.ReactNode
  tsMs: number
  children: React.ReactNode
}

function Row({ icon, tsMs, children }: RowProps) {
  return (
    <Group
      gap="xs"
      wrap="nowrap"
      align="flex-start"
      px="xs"
      py={4}
      style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}
    >
      <Box mt={2} style={{ flexShrink: 0, lineHeight: 0 }}>
        {icon}
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>{children}</Box>
      <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>
        {formatTime(tsMs)}
      </Text>
    </Group>
  )
}

/** Длинный текст показываем куском, остальное — по клику. */
function Expandable({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const isLong = text.length > PREVIEW_LIMIT

  return (
    <>
      <Text
        size="xs"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {open || !isLong ? text : `${text.slice(0, PREVIEW_LIMIT)}…`}
      </Text>
      {isLong && (
        <Anchor
          component="button"
          type="button"
          size="xs"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'свернуть' : 'показать целиком'}
        </Anchor>
      )}
    </>
  )
}

function EventRow({ event }: { event: TaskEvent }) {
  if (event.kind === 'agent_tool') {
    const tool = str(event.payload, 'tool') || 'tool'
    const detail = str(event.payload, 'detail')

    return (
      <Row
        tsMs={event.tsMs}
        icon={<IconTool size={13} color="var(--mantine-color-violet-4)" />}
      >
        <Group gap={6} wrap="nowrap" align="baseline">
          <Text size="xs" fw={600} ff="monospace">
            {tool}
          </Text>
          {detail && (
            <Text size="xs" c="dimmed" ff="monospace" truncate title={detail}>
              {detail}
            </Text>
          )}
        </Group>
      </Row>
    )
  }

  if (event.kind === 'agent_text') {
    return (
      <Row
        tsMs={event.tsMs}
        icon={<IconMessage size={13} color="var(--mantine-color-blue-4)" />}
      >
        <Expandable text={str(event.payload, 'text')} />
      </Row>
    )
  }

  if (event.kind === 'blocked') {
    return (
      <Row
        tsMs={event.tsMs}
        icon={<IconHandStop size={13} color="var(--mantine-color-orange-5)" />}
      >
        <Text size="xs" fw={600} c="orange" mb={2}>
          Агент остановился и ждёт человека
        </Text>
        <Expandable text={str(event.payload, 'questions')} />
      </Row>
    )
  }

  if (event.kind === 'stage_failed') {
    return (
      <Row
        tsMs={event.tsMs}
        icon={
          <IconAlertTriangle size={13} color="var(--mantine-color-red-5)" />
        }
      >
        <Text size="xs" fw={600} c="red" mb={2}>
          Стадия упала
        </Text>
        <Code block fz={10}>
          {str(event.payload, 'error')}
        </Code>
      </Row>
    )
  }

  // stage_started / stage_finished видно по степперу — в ленте они шум.
  return null
}

interface EventStreamProps {
  events: TaskEvent[]
  height?: number
}

export function EventStream({ events, height = 280 }: EventStreamProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const visible = events.filter(
    (e) => e.kind !== 'stage_started' && e.kind !== 'stage_finished',
  )

  // Автоскролл вниз по мере поступления. Зависимость — длина, а не сам массив:
  // иначе скролл дёргается на каждом ререндере родителя.
  useEffect(() => {
    const el = viewport.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visible.length])

  if (visible.length === 0) {
    return (
      <Text size="xs" c="dimmed" p="xs">
        Пока нет событий агента
      </Text>
    )
  }

  return (
    <ScrollArea h={height} type="auto" viewportRef={viewport}>
      <Stack gap={0}>
        {visible.map((event) => (
          <EventRow key={event.seq} event={event} />
        ))}
      </Stack>
    </ScrollArea>
  )
}
