import {
  ActionIcon,
  Badge,
  Box,
  Collapse,
  Group,
  Table,
  Text,
} from '@mantine/core'
import { IconCheck, IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'
import { PipelineStages } from './PipelineStages'
import type { Task } from './types'
import { TaskExpandedContent } from './TaskExpandedContent'

interface TaskRowProps {
  task: Task
}

export function TaskRow({ task }: TaskRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <Table.Tr
        style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        {/* Expand button */}
        <Table.Td style={{ width: 40, padding: '12px 8px' }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setExpanded(!expanded)}
            style={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Table.Td>

        {/* Status */}
        <Table.Td style={{ width: 100, padding: '12px 16px' }}>
          <Group gap="xs">
            <IconCheck size={16} color="var(--mantine-color-green-6)" />
            <Text size="sm" fw={500} c="green">
              {task.status.toUpperCase()}
            </Text>
          </Group>
        </Table.Td>

        {/* Task info */}
        <Table.Td style={{ padding: '12px 16px' }}>
          <Box>
            <Group gap="xs" mb={4}>
              <Text size="sm" fw={500} c="orange">
                #{task.number}
              </Text>
              <Text size="sm">{task.title}</Text>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {task.repository}
              </Text>
              {task.attempts && (
                <Badge size="sm" variant="light" color="gold">
                  попытка {task.attempts}
                </Badge>
              )}
            </Group>
          </Box>
        </Table.Td>

        {/* Pipeline stages */}
        <Table.Td style={{ width: 300, padding: '12px 16px' }}>
          <PipelineStages
            stages={task.stages}
            completedStages={task.completedStages}
          />
        </Table.Td>

        {/* Duration */}
        <Table.Td style={{ width: 100, padding: '12px 16px' }}>
          <Text size="sm">{task.duration}</Text>
        </Table.Td>

        {/* Tokens */}
        <Table.Td
          style={{ width: 120, padding: '12px 16px', textAlign: 'right' }}
        >
          <Text size="sm" c="dimmed">
            {task.tokens}
          </Text>
        </Table.Td>
      </Table.Tr>

      {/* Expanded content row */}
      <Table.Tr>
        <Table.Td colSpan={6} style={{ padding: 0, border: 'none' }}>
          <Collapse expanded={expanded}>
            <Box
              p="md"
              bg="dark.8"
              style={{
                borderBottom: '1px solid var(--mantine-color-dark-4)',
              }}
            >
              <TaskExpandedContent task={task} />
            </Box>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  )
}
