// TaskView — расширенная панель задачи в стиле foundry/TaskDetails.
// Показывает: мета-заголовок, таймлайн стадий (точки + коннекторы),
// StageDetailPanel выбранной стадии.
// Используется вместо TaskExpandedContent.

import { useState } from 'react'
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Collapse,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Textarea,
  ThemeIcon,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconGitBranch,
  IconBulb,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconExternalLink,
  IconFolder,
  IconHandStop,
  IconHash,
  IconPlayerPlay,
  IconSparkles,
  IconTool,
  IconMessage,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Stage, StageView, TaskEvent, TaskView } from '@/types'
import { PIPELINE, STAGE_TITLE } from '@/types'
import { resumeTask } from '@/api'
import { defaultStage, stageDetail } from '@/lib/liveTask'
import { stageAgent, stageTokens, taskTokens, tokensToUsd, MOCK_REPO, issueUrl } from '@/lib/mock'
import { formatDuration, formatTokens, formatUsd } from './formatDuration'
import { getStatusColor } from './statusColor'

// ─── helpers ──────────────────────────────────────────────────────────────────

const AGENT_STAGES = new Set<Stage>(['plan', 'implement'])

function fmtTs(ms: number): string {
  try {
    const d = new Date(ms)
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':')
  } catch {
    return ''
  }
}

// ─── StageStepper ─────────────────────────────────────────────────────────────
// Точки + коннекторы как в foundry/StageStepper, на Mantine-токенах.

interface StepperProps {
  stages: StageView[]
  selected: Stage
  onSelect: (s: Stage) => void
}

const DOT = 16  // px diameter for lg variant

function StageStepper({ stages, selected, onSelect }: StepperProps) {
  const byStage = new Map(stages.map((s) => [s.stage, s]))

  // Space reserved below each dot for the label text.
  const LABEL_GAP = DOT + 22

  return (
    <Box style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
      {PIPELINE.map((stage, idx) => {
        const s = byStage.get(stage) ?? { stage, status: 'pending' as const, durationMs: null }
        const isDone = s.status === 'done'
        const isRunning = s.status === 'running'
        const isFailed = s.status === 'failed'
        const isSelected = selected === stage

        const dotColor = isDone
          ? 'var(--mantine-color-green-6)'
          : isRunning
            ? 'var(--mantine-color-yellow-5)'
            : isFailed
              ? 'var(--mantine-color-red-6)'
              : 'var(--mantine-color-dark-4)'

        const connColor = isDone
          ? 'var(--mantine-color-green-6)'
          : 'var(--mantine-color-dark-4)'

        const labelColor = isRunning
          ? 'var(--mantine-color-yellow-4)'
          : isDone
            ? 'var(--mantine-color-gray-4)'
            : isFailed
              ? 'var(--mantine-color-red-4)'
              : 'var(--mantine-color-dimmed)'

        return (
          <Box
            key={stage}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {/* dot column — paddingBottom reserves space for the absolute label
                so the connector (which shares the same flex row) can use the
                same marginBottom to stay horizontally aligned with dot centres */}
            <Box
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingBottom: LABEL_GAP,
              }}
            >
              <Box
                role="button"
                tabIndex={0}
                onClick={() => onSelect(stage)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(stage) }
                }}
                style={{
                  width: DOT,
                  height: DOT,
                  borderRadius: '50%',
                  background: dotColor,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  outline: isSelected ? '2px solid var(--mantine-color-violet-4)' : 'none',
                  outlineOffset: 2,
                  animation: isRunning ? 'pico-pulse 1.4s ease-in-out infinite' : 'none',
                  transition: 'outline-color .15s',
                  boxShadow: isRunning ? '0 0 0 3px var(--mantine-color-yellow-9)' : 'none',
                }}
              >
                {isDone && <IconCheck size={8} color="#fff" stroke={3} />}
                {isFailed && <IconX size={8} color="#fff" stroke={3} />}
              </Box>
              {/* label sits below the dot via absolute positioning */}
              <Text
                size="xs"
                style={{
                  position: 'absolute',
                  top: DOT + 6,
                  whiteSpace: 'nowrap',
                  color: labelColor,
                  fontWeight: isRunning || isFailed ? 600 : 400,
                  fontSize: 11,
                  pointerEvents: 'none',
                }}
              >
                {STAGE_TITLE[stage] ?? stage}
              </Text>
            </Box>

            {/* connector — marginBottom mirrors dot's paddingBottom so the
                1.5 px line stays vertically centred on the dot circles */}
            {idx < PIPELINE.length - 1 && (
              <Box
                style={{
                  width: 56,
                  height: 1.5,
                  background: connColor,
                  flexShrink: 0,
                  marginBottom: LABEL_GAP,
                  transition: 'background .3s',
                }}
              />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

// ─── StageIO ──────────────────────────────────────────────────────────────────

const TEXT_HEIGHT_LIMIT = 180

function KVList({ items }: { items: [string, string][] }) {
  const [expanded, setExpanded] = useState(false)
  const hasLong = items.some(([, v]) => v.length > 80 || v.includes('\n'))
  return (
    <Box>
      <Box
        component="dl"
        style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }}
      >
        {items.map(([k, v], i) => (
          <Box key={`${i}-${k}`} style={{ display: 'contents' }}>
            <Text
              component="dt"
              size="xs"
              ff="monospace"
              c="dimmed"
              style={{ whiteSpace: 'nowrap' }}
            >
              {k}
            </Text>
            <Text
              component="dd"
              size="xs"
              ff="monospace"
              style={{
                margin: 0,
                overflow: 'hidden',
                textOverflow: expanded ? 'clip' : 'ellipsis',
                whiteSpace: expanded ? 'pre-wrap' : 'nowrap',
                wordBreak: expanded ? 'break-word' : 'normal',
              }}
              title={expanded ? undefined : v}
            >
              {v}
            </Text>
          </Box>
        ))}
      </Box>
      {hasLong && (
        <Anchor
          component="button"
          type="button"
          size="xs"
          mt={6}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'свернуть' : 'показать всё'}
        </Anchor>
      )}
    </Box>
  )
}

function TextBlock({ text, label }: { text: string; label?: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 400 || text.split('\n').length > 8
  return (
    <Box>
      {label && (
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4} style={{ letterSpacing: '.06em', fontSize: 10 }}>
          {label}
        </Text>
      )}
      <Box
        component="pre"
        ff="monospace"
        style={{
          margin: 0,
          fontSize: 11.5,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: expanded ? 'none' : TEXT_HEIGHT_LIMIT,
          overflow: expanded ? 'visible' : 'hidden',
          background: 'transparent',
          color: 'inherit',
        }}
      >
        {text}
      </Box>
      {isLong && (
        <Anchor
          component="button"
          type="button"
          size="xs"
          mt={6}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'свернуть' : 'показать всё'}
        </Anchor>
      )}
    </Box>
  )
}

function StageIORenderer({ data }: { data: unknown }) {
  if (!data) {
    return <Text size="xs" c="dimmed">нет данных</Text>
  }

  if (typeof data === 'string') {
    return <TextBlock text={data} />
  }

  if (Array.isArray(data)) {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {(data as unknown[]).map((f, i) => (
          <Text key={i} size="xs" ff="monospace" c="dimmed">
            {String(f)}
          </Text>
        ))}
      </Box>
    )
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    const kind = typeof obj.kind === 'string' ? obj.kind : undefined

    if (kind === 'kv' && Array.isArray(obj.items)) {
      const items = (obj.items as unknown[])
        .filter((it): it is [string, unknown] => Array.isArray(it) && it.length === 2)
        .map(([k, v]) => [String(k), stringify(v)] as [string, string])
      return items.length > 0 ? <KVList items={items} /> : <Text size="xs" c="dimmed">нет данных</Text>
    }

    if (kind === 'text' && typeof obj.text === 'string') {
      return <TextBlock text={obj.text} label={obj.label as string | undefined} />
    }

    if (kind === 'files' && Array.isArray(obj.items)) {
      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {(obj.items as unknown[]).map((f, i) => (
            <Text key={i} size="xs" ff="monospace">{String(f)}</Text>
          ))}
        </Box>
      )
    }

    if (kind === 'error' && typeof obj.text === 'string') {
      return (
        <Alert color="red" variant="light" title={String(obj.label ?? 'Ошибка')}>
          <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>{obj.text}</Text>
        </Alert>
      )
    }

    // summary+text shape
    if (typeof obj.summary === 'string') {
      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text size="sm" fw={600} style={{ lineHeight: 1.4 }}>{obj.summary}</Text>
          {typeof obj.text === 'string' && obj.text !== obj.summary && (
            <TextBlock text={obj.text} />
          )}
        </Box>
      )
    }

    // generic kv fallback
    const LONG_TEXT_KEYS = new Set(['prompt', 'plan', 'text'])
    const kvEntries: [string, string][] = []
    const textEntries: [string, string][] = []
    for (const [k, v] of Object.entries(obj)) {
      if (LONG_TEXT_KEYS.has(k) && typeof v === 'string' && v.length > 0) {
        textEntries.push([k, v])
      } else {
        kvEntries.push([k, stringify(v)])
      }
    }
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {kvEntries.length > 0 && <KVList items={kvEntries} />}
        {textEntries.map(([k, v]) => <TextBlock key={k} label={k} text={v} />)}
      </Box>
    )
  }

  return <Text size="xs" ff="monospace">{stringify(data)}</Text>
}

function stringify(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try { return JSON.stringify(v) } catch { return String(v) }
}

// ─── AgentBadge ───────────────────────────────────────────────────────────────

function AgentBadge({ name, model }: { name: string; model: string }) {
  return (
    <Group
      gap={6}
      px={8}
      py={3}
      style={{
        borderRadius: 999,
        border: '1px solid var(--mantine-color-dark-4)',
        background: 'var(--mantine-color-dark-7)',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <Box
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'var(--mantine-color-violet-6)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <IconSparkles size={10} color="#fff" />
      </Box>
      {name && <Text size="xs" fw={500}>{name}</Text>}
      {model && (
        <>
          <Text size="xs" c="dimmed">·</Text>
          <Text size="xs" ff="monospace" c="dimmed">{model}</Text>
        </>
      )}
    </Group>
  )
}

// ─── AskAgentComposer ─────────────────────────────────────────────────────────

function AskAgentComposer({ agentName, stageLabel }: { agentName: string; stageLabel: string }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  return (
    <Box style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 14px',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
        }}
      >
        <IconBulb size={13} color="var(--mantine-color-violet-4)" />
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '.06em' }}>
          Спросить у агента
        </Text>
        <span style={{ flex: 1 }} />
        <IconChevronRight
          size={13}
          color="var(--mantine-color-dimmed)"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform .18s ease',
          }}
        />
      </Box>
      <Collapse expanded={open}>
        <Box px={14} pb={12}>
          <Text size="xs" c="dimmed" mb={8}>
            контекст стадии{' '}
            <Text span size="xs" ff="monospace">{stageLabel}</Text>{' '}
            прикладывается автоматически
          </Text>
          <Box
            style={{
              border: '1px solid var(--mantine-color-dark-3)',
              borderRadius: 6,
              background: 'var(--mantine-color-dark-8)',
              padding: 10,
            }}
          >
            <Textarea
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              placeholder={`Уточнить у ${agentName} — что именно сделано и почему`}
              minRows={3}
              autosize
              styles={{ input: { background: 'transparent', border: 0, padding: 0, fontSize: 13 } }}
            />
            <Group justify="space-between" mt={8} pt={8} style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
              <Text size="xs" c="dimmed">⌘+Enter — отправить</Text>
              <Box
                component="button"
                type="button"
                disabled
                title="скоро будет"
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: 'var(--mantine-color-violet-7)',
                  color: '#fff',
                  border: 0,
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                Отправить
              </Box>
            </Group>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

// ─── StageDetailPanel ─────────────────────────────────────────────────────────

interface StageDetailPanelProps {
  taskId: number
  stage: StageView
  events: TaskEvent[]
}

function StageDetailPanel({ taskId, stage, events }: StageDetailPanelProps) {
  const stageEvents = events.filter((e) => e.stage === stage.stage)
  const detail = stageDetail(events, stage.stage)
  const agentMock = stageAgent(stage.stage)
  const tokens = stageTokens(taskId, stage)
  const isAgentStage = AGENT_STAGES.has(stage.stage)
  const isRunning = stage.status === 'running'
  const isFailed = stage.status === 'failed'
  const isDone = stage.status === 'done'
  const isPending = stage.status === 'pending'

  const defaultTab = isAgentStage ? 'stream' : 'output'
  const [tab, setTab] = useState<string>(defaultTab)

  const statusColor = getStatusColor(stage.status)

  if (isPending) {
    return (
      <Paper withBorder p="md">
        <Group gap="sm">
          <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
            <IconClock size={14} />
          </ThemeIcon>
          <Box>
            <Text size="sm">
              Стадия <b>{STAGE_TITLE[stage.stage] ?? stage.stage}</b> ещё не выполнялась
            </Text>
            <Text size="xs" c="dimmed">Начнётся после завершения предыдущих.</Text>
          </Box>
        </Group>
      </Paper>
    )
  }

  return (
    <Paper withBorder style={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box
        px="md"
        py="xs"
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-4)',
          background: isRunning
            ? 'var(--mantine-color-yellow-9)'
            : isFailed
              ? 'var(--mantine-color-red-9)'
              : 'var(--mantine-color-dark-7)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <Text
          size="xs"
          fw={700}
          tt="uppercase"
          style={{ letterSpacing: '.1em', color: statusColor }}
        >
          {STAGE_TITLE[stage.stage] ?? stage.stage}
        </Text>
        <Text size="xs" c="dimmed">·</Text>

        {isRunning && (
          <Group gap={6}>
            <Box
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--mantine-color-yellow-4)',
                animation: 'pico-pulse 1.4s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <Text size="xs" c="yellow.4">идёт сейчас</Text>
          </Group>
        )}
        {isDone && (
          <Group gap={5}>
            <IconCheck size={12} color="var(--mantine-color-green-5)" />
            <Text size="xs" c="green.5">завершено</Text>
          </Group>
        )}
        {isFailed && (
          <Group gap={5}>
            <IconX size={12} color="var(--mantine-color-red-5)" />
            <Text size="xs" c="red.5">провал</Text>
          </Group>
        )}

        <Box style={{ flex: 1 }} />

        {agentMock && <AgentBadge name={agentMock.name} model={agentMock.model} />}

        <Group gap={10}>
          {stage.durationMs !== null && (
            <Group gap={4}>
              <IconClock size={12} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">{formatDuration(stage.durationMs)}</Text>
            </Group>
          )}
          {tokens > 0 && (
            <Text size="xs" c="dimmed">{formatTokens(tokens)} ток.</Text>
          )}
        </Group>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(v) => setTab(v ?? defaultTab)} variant="default">
        <Tabs.List>
          <Tabs.Tab value="input" fz="xs">Вход</Tabs.Tab>
          {isAgentStage && (
            <Tabs.Tab
              value="stream"
              fz="xs"
              rightSection={
                isRunning
                  ? (
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--mantine-color-yellow-4)',
                        animation: 'pico-pulse 1.4s ease-in-out infinite',
                      }}
                    />
                  )
                  : (
                    <Badge size="xs" variant="light" circle>
                      {stageEvents.filter(e => e.kind !== 'stage_started' && e.kind !== 'stage_finished').length}
                    </Badge>
                  )
              }
            >
              Поток событий
            </Tabs.Tab>
          )}
          <Tabs.Tab value="output" fz="xs">Выход</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="input" p="md" mih={120}>
          <StageIORenderer data={detail.input} />
        </Tabs.Panel>

        {isAgentStage && (
          <Tabs.Panel value="stream" mih={120}>
            <EventStreamPanel events={stageEvents} />
          </Tabs.Panel>
        )}

        <Tabs.Panel value="output" p="md" mih={120}>
          <StageIORenderer data={detail.output} />
        </Tabs.Panel>
      </Tabs>

      {/* Traceback */}
      {isFailed && detail.error && (
        <Box p="md" pt={0}>
          <Alert color="red" variant="light" icon={<IconAlertTriangle size={16} />} title="Стадия упала">
            <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>{detail.error}</Text>
          </Alert>
        </Box>
      )}

      {/* AskAgentComposer stub */}
      {isAgentStage && (
        <AskAgentComposer
          agentName={agentMock?.name ?? 'агента'}
          stageLabel={STAGE_TITLE[stage.stage] ?? stage.stage}
        />
      )}
    </Paper>
  )
}

// ─── EventStreamPanel ─────────────────────────────────────────────────────────

function EventStreamPanel({ events }: { events: TaskEvent[] }) {
  const viewport = React.useRef<HTMLDivElement>(null)
  const visible = events.filter(
    (e) => e.kind !== 'stage_started' && e.kind !== 'stage_finished',
  )

  React.useEffect(() => {
    const el = viewport.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visible.length])

  if (visible.length === 0) {
    return <Text size="xs" c="dimmed" p="xs">Пока нет событий агента</Text>
  }

  return (
    <Box
      ref={viewport}
      style={{ maxHeight: 300, overflowY: 'auto', padding: '6px 0' }}
    >
      {visible.map((event) => <EventRow key={event.seq} event={event} />)}
    </Box>
  )
}

function EventRow({ event }: { event: TaskEvent }) {
  const [open, setOpen] = useState(false)

  if (event.kind === 'agent_tool') {
    const tool = str(event.payload, 'tool') || 'tool'
    const detail = str(event.payload, 'detail')
    return (
      <Group
        gap={8}
        px="xs"
        py={4}
        align="flex-start"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}
      >
        <Box mt={2} style={{ flexShrink: 0 }}><IconTool size={13} color="var(--mantine-color-violet-4)" /></Box>
        <Group gap={6} style={{ flex: 1, minWidth: 0 }} align="baseline" wrap="nowrap">
          <Text size="xs" fw={600} ff="monospace">{tool}</Text>
          {detail && (
            <Text size="xs" c="dimmed" ff="monospace" truncate title={detail}>{detail}</Text>
          )}
        </Group>
        <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>{fmtTs(event.tsMs)}</Text>
      </Group>
    )
  }

  if (event.kind === 'agent_text') {
    const text = str(event.payload, 'text')
    const preview = text.length > 220 ? `${text.slice(0, 220)}…` : text
    return (
      <Group
        gap={8}
        px="xs"
        py={4}
        align="flex-start"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}
      >
        <Box mt={2} style={{ flexShrink: 0 }}><IconMessage size={13} color="var(--mantine-color-blue-4)" /></Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {open ? text : preview}
          </Text>
          {text.length > 220 && (
            <Anchor component="button" type="button" size="xs" onClick={() => setOpen((v) => !v)}>
              {open ? 'свернуть' : 'показать целиком'}
            </Anchor>
          )}
        </Box>
        <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>{fmtTs(event.tsMs)}</Text>
      </Group>
    )
  }

  if (event.kind === 'blocked') {
    return (
      <Group
        gap={8}
        px="xs"
        py={4}
        align="flex-start"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}
      >
        <Box mt={2} style={{ flexShrink: 0 }}><IconHandStop size={13} color="var(--mantine-color-orange-5)" /></Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" fw={600} c="orange" mb={2}>Агент остановился и ждёт человека</Text>
          <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>{str(event.payload, 'questions')}</Text>
        </Box>
        <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>{fmtTs(event.tsMs)}</Text>
      </Group>
    )
  }

  if (event.kind === 'stage_failed') {
    return (
      <Group
        gap={8}
        px="xs"
        py={4}
        align="flex-start"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}
      >
        <Box mt={2} style={{ flexShrink: 0 }}><IconAlertTriangle size={13} color="var(--mantine-color-red-5)" /></Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" fw={600} c="red" mb={2}>Стадия упала</Text>
          <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap', fontSize: 10 }}>
            {str(event.payload, 'error')}
          </Text>
        </Box>
        <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>{fmtTs(event.tsMs)}</Text>
      </Group>
    )
  }

  return null
}

function str(payload: Record<string, unknown>, key: string): string {
  const v = payload[key]
  return typeof v === 'string' ? v : ''
}

// ─── Main export: TaskView ────────────────────────────────────────────────────

import * as React from 'react'

interface TaskViewProps {
  task: TaskView
  events: TaskEvent[]
  connected: boolean
}

export function TaskView({ task, events, connected }: TaskViewProps) {
  const queryClient = useQueryClient()

  const [picked, setPicked] = useState<Stage | null>(null)
  const activeStage = picked ?? defaultStage(task)
  const stage = task.stages.find((s) => s.stage === activeStage) ?? task.stages[0]

  const { mutate: resume, isPending: isResuming } = useMutation({
    mutationFn: () => resumeTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', task.id] })
    },
  })

  const questions = stageDetail(events, 'plan').questions
  const tokens = taskTokens(task)
  const ghUrl = issueUrl(task)

  return (
    <Stack gap="md">
      {/* Blocked alert */}
      {task.status === 'blocked' && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconHandStop size={16} />}
          title="Агент ждёт ответа человека"
        >
          <Stack gap="xs" align="flex-start">
            {questions && (
              <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>{questions}</Text>
            )}
            <Button
              size="xs"
              color="orange"
              variant="filled"
              leftSection={<IconPlayerPlay size={14} />}
              loading={isResuming}
              onClick={() => resume()}
            >
              Возобновить
            </Button>
          </Stack>
        </Alert>
      )}

      {/* Meta header */}
      <Paper withBorder p="md">
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <Stack gap={6}>
            <Group gap={6} wrap="nowrap">
              <Text size="sm" fw={600} c="orange" style={{ flexShrink: 0 }}>
                #{task.issueNumber}
              </Text>
              <Text size="sm" fw={600} style={{ lineHeight: 1.4 }}>
                {task.issueTitle}
              </Text>
            </Group>

            <Group gap={14} style={{ flexWrap: 'wrap' }}>
              <Group gap={5} wrap="nowrap">
                <IconHash size={11} color="var(--mantine-color-dimmed)" />
                <Text size="xs" ff="monospace" c="dimmed">{MOCK_REPO}</Text>
              </Group>
              {task.branch && (
                <Group gap={5} wrap="nowrap">
                  <IconGitBranch size={11} color="var(--mantine-color-dimmed)" />
                  <Text size="xs" ff="monospace" c="dimmed" truncate style={{ maxWidth: 280 }}>
                    {task.branch}
                  </Text>
                </Group>
              )}
              {task.worktreePath && (
                <Group gap={5} wrap="nowrap">
                  <IconFolder size={11} color="var(--mantine-color-dimmed)" />
                  <Text size="xs" ff="monospace" c="dimmed" truncate style={{ maxWidth: 320 }} title={task.worktreePath}>
                    {task.worktreePath}
                  </Text>
                </Group>
              )}
              <Anchor href={ghUrl} target="_blank" rel="noreferrer" size="xs">
                <Group gap={4} wrap="nowrap">
                  <span>открыть issue</span>
                  <IconExternalLink size={11} />
                </Group>
              </Anchor>
              {task.prUrl && (
                <Anchor href={task.prUrl} target="_blank" rel="noreferrer" size="xs" c="orange">
                  <Group gap={4} wrap="nowrap">
                    <span>PR</span>
                    <IconExternalLink size={11} />
                  </Group>
                </Anchor>
              )}
            </Group>
          </Stack>

          {/* Right-side stats */}
          <Stack gap={4} align="flex-end">
            <Badge size="xs" variant="light" color={connected ? 'green' : 'gray'}>
              {connected ? '● live' : '○ offline'}
            </Badge>
            <Group gap={4}>
              <Text size="xs" c="dimmed">{formatTokens(tokens)} ток.</Text>
              <Text size="xs" c="dimmed">≈ {formatUsd(tokensToUsd(tokens))}</Text>
            </Group>
            {task.attempts > 1 && (
              <Badge size="xs" variant="light" color="yellow">
                попытка {task.attempts}
              </Badge>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Stage timeline */}
      <Paper withBorder p="md">
        <Group justify="space-between" mb={18} align="baseline">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '.1em' }}>
            Таймлайн стадий
          </Text>
          <Text size="xs" style={{ color: connected ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-dimmed)' }}>
            {connected ? '● live' : 'кликните на стадию, чтобы увидеть детали'}
          </Text>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <StageStepper
            stages={task.stages}
            selected={activeStage}
            onSelect={(s) => setPicked(s as Stage)}
          />
        </Box>
      </Paper>

      {/* Stage detail */}
      {stage && (
        <StageDetailPanel
          key={stage.stage}
          taskId={task.id}
          stage={stage}
          events={events}
        />
      )}
    </Stack>
  )
}
