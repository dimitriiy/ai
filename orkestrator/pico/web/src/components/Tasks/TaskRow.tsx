import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Collapse,
  Group,
  Loader,
  Table,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconHandStop,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskStatus, TaskView } from '@/types'
import { runTask } from '@/api'
import { projectLiveTask } from '@/lib/liveTask'
import { taskTokens } from '@/lib/mock'
import { useTaskStream } from '@/hooks/useTaskStream'
import { PipelineStages } from './PipelineStages'
import { TaskView as TaskViewPanel } from './TaskView'
import {
  formatDuration,
  formatTokens,
  sumStagesDurationMs,
} from './formatDuration'
import { getStatusColor, STATUS_LABEL } from './statusColor'

interface TaskRowProps {
  task: TaskView
}

function StatusIcon({ status }: { status: TaskStatus }) {
  const color = getStatusColor(status)

  if (status === 'running') return <Loader size={14} color="yellow" />
  if (status === 'done') return <IconCheck size={16} color={color} />
  if (status === 'failed') return <IconAlertTriangle size={16} color={color} />
  if (status === 'blocked') return <IconHandStop size={16} color={color} />
  return <IconClock size={16} color={color} />
}

export function TaskRow({ task: snapshot }: TaskRowProps) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()

  // Подписываемся только у раскрытой строки: иначе на каждую задачу в списке
  // висел бы отдельный EventSource. Пока строка свёрнута, хватает поллинга.
  const stream = useTaskStream(expanded ? snapshot.id : null)

  // Снапшот списка обновляется раз в 3 секунды — накатываем поверх поток,
  // чтобы кружки стадий двигались сразу, а не рывками.
  const task = projectLiveTask(stream.task ?? snapshot, stream.events)

  const { mutate: run, isPending: isRunning } = useMutation({
    mutationFn: () => runTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', task.id] })
    },
  })

  const canRun = task.status === 'pending' || task.status === 'failed'
  const tokens = taskTokens(task)

  return (
    <>
      <Table.Tr
        onClick={() => setExpanded((v) => !v)}
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-4)',
          cursor: 'pointer',
        }}
      >
        {/* Раскрытие */}
        <Table.Td style={{ width: 40, padding: '12px 8px' }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={expanded ? 'Скрыть детали' : 'Показать детали'}
            style={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Table.Td>

        {/* Статус */}
        <Table.Td style={{ width: 120, padding: '12px 16px' }}>
          <Group gap="xs" wrap="nowrap">
            <StatusIcon status={task.status} />
            <Text
              size="sm"
              fw={500}
              style={{ color: getStatusColor(task.status) }}
            >
              {STATUS_LABEL[task.status] ?? task.status.toUpperCase()}
            </Text>
          </Group>
        </Table.Td>

        {/* Задача */}
        <Table.Td style={{ padding: '12px 16px' }}>
          <Box>
            <Group gap="xs" mb={4} wrap="nowrap">
              <Text size="sm" fw={500} c="orange" style={{ flexShrink: 0 }}>
                #{task.issueNumber}
              </Text>
              <Text size="sm" truncate title={task.issueTitle}>
                {task.issueTitle}
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed" ff="monospace">
                {task.branch ?? 'ветки пока нет'}
              </Text>
              {/* Первая попытка — не новость, показываем только повторы.
                  Заодно не даём React вывести голый 0 из `attempts &&`. */}
              {task.attempts > 1 && (
                <Badge size="sm" variant="light" color="yellow">
                  попытка {task.attempts}
                </Badge>
              )}
            </Group>
          </Box>
        </Table.Td>

        {/* Стадии */}
        <Table.Td style={{ width: 260, padding: '12px 16px' }}>
          <PipelineStages stages={task.stages} />
        </Table.Td>

        {/* Время и токены */}
        <Table.Td style={{ width: 110, padding: '12px 16px' }}>
          <Text size="sm">
            {formatDuration(sumStagesDurationMs(task.stages))}
          </Text>
          <Text size="xs" c="dimmed">
            {formatTokens(tokens)} ток.
          </Text>
        </Table.Td>

        {/* Действия */}
        <Table.Td
          style={{ width: 130, padding: '12px 16px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {task.status === 'blocked' ? (
            <Button
              size="xs"
              variant="light"
              color="orange"
              leftSection={<IconHandStop size={14} />}
              onClick={() => setExpanded(true)}
            >
              Ответить
            </Button>
          ) : (
            <Tooltip
              label="Запустить можно только новую или упавшую задачу"
              disabled={canRun}
              withArrow
            >
              <Box>
                <Button
                  size="xs"
                  variant="light"
                  disabled={!canRun}
                  leftSection={<IconPlayerPlay size={14} />}
                  loading={isRunning}
                  onClick={() => run()}
                >
                  {task.status === 'failed' ? 'Ещё раз' : 'Запустить'}
                </Button>
              </Box>
            </Tooltip>
          )}
        </Table.Td>
      </Table.Tr>

      <Table.Tr>
        <Table.Td colSpan={6} style={{ padding: 0, border: 'none' }}>
          <Collapse expanded={expanded}>
            <Box
              p="md"
              bg="dark.8"
              style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
            >
              <TaskViewPanel
                task={task}
                events={stream.events}
                connected={stream.connected}
              />
            </Box>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  )
}
