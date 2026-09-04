import { useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Group,
  Paper,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconClock,
  IconSparkles,
} from '@tabler/icons-react'
import type { StageView, TaskEvent } from '@/types'
import { STAGE_TITLE } from '@/types'
import { stageDetail } from '@/lib/liveTask'
import { stageAgent, stageTokens } from '@/lib/mock'
import { EventStream } from './EventStream'
import { StageIO } from './StageIO'
import { formatDuration, formatTokens } from './formatDuration'
import { getStatusColor, STATUS_LABEL } from './statusColor'

interface StageDetailProps {
  taskId: number
  stage: StageView
  /** Все события задачи — фильтруем по стадии внутри. */
  events: TaskEvent[]
}

export function StageDetail({ taskId, stage, events }: StageDetailProps) {
  const stageEvents = events.filter((e) => e.stage === stage.stage)
  const detail = stageDetail(events, stage.stage)
  const agent = stageAgent(stage.stage)
  const tokens = stageTokens(taskId, stage)

  const [tab, setTab] = useState<string | null>(agent ? 'stream' : 'output')

  if (stage.status === 'pending') {
    return (
      <Paper withBorder p="md">
        <Group gap="sm">
          <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
            <IconClock size={14} />
          </ThemeIcon>
          <Box>
            <Text size="sm">
              Стадия <b>{stage.stage}</b> ещё не выполнялась
            </Text>
            <Text size="xs" c="dimmed">
              Начнётся после завершения предыдущих.
            </Text>
          </Box>
        </Group>
      </Paper>
    )
  }

  return (
    <Paper withBorder>
      <Group
        justify="space-between"
        p="xs"
        px="md"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group gap="sm">
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            style={{ color: getStatusColor(stage.status) }}
          >
            {STAGE_TITLE[stage.stage] ?? stage.stage}
          </Text>
          <Badge
            size="xs"
            variant="light"
            color={stage.status === 'done' ? 'green' : undefined}
            style={
              stage.status !== 'done'
                ? { color: getStatusColor(stage.status) }
                : undefined
            }
          >
            {STATUS_LABEL[stage.status] ?? stage.status}
          </Badge>
        </Group>

        <Group gap="md">
          {agent && (
            <Group gap={4}>
              <IconSparkles size={12} color="var(--mantine-color-violet-4)" />
              <Text size="xs">{agent.name}</Text>
              <Text size="xs" c="dimmed" ff="monospace">
                {agent.model}
              </Text>
            </Group>
          )}
          {stage.durationMs !== null && (
            <Group gap={4}>
              <IconClock size={12} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                {formatDuration(stage.durationMs)}
              </Text>
            </Group>
          )}
          {tokens > 0 && (
            <Text size="xs" c="dimmed">
              {formatTokens(tokens)} ток.
            </Text>
          )}
        </Group>
      </Group>

      <Tabs value={tab} onChange={setTab} variant="default">
        <Tabs.List>
          <Tabs.Tab value="input" fz="xs">
            Вход
          </Tabs.Tab>
          <Tabs.Tab
            value="stream"
            fz="xs"
            rightSection={
              <Badge size="xs" variant="light" circle>
                {stageEvents.length}
              </Badge>
            }
          >
            Поток
          </Tabs.Tab>
          <Tabs.Tab value="output" fz="xs">
            Выход
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="input" p="md">
          <StageIO data={detail.input} />
        </Tabs.Panel>

        <Tabs.Panel value="stream">
          <EventStream events={stageEvents} height={260} />
        </Tabs.Panel>

        <Tabs.Panel value="output" p="md">
          <StageIO data={detail.output} />
        </Tabs.Panel>
      </Tabs>

      {detail.error && (
        <Box p="md" pt={0}>
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertTriangle size={16} />}
            title="Стадия упала"
          >
            <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>
              {detail.error}
            </Text>
          </Alert>
        </Box>
      )}
    </Paper>
  )
}
