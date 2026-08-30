import { Table, Text, Box } from '@mantine/core'
import { TaskRow } from './TaskRow'
import type { Task } from './types'

interface TasksTableProps {
  tasks: Task[]
}

export function TasksTable({ tasks }: TasksTableProps) {
  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr
            style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
          >
            <Table.Th style={{ width: 40 }}></Table.Th>
            <Table.Th style={{ width: 100 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Статус
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Задача
              </Text>
            </Table.Th>
            <Table.Th style={{ width: 300 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Стадии
              </Text>
            </Table.Th>
            <Table.Th style={{ width: 100 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Длит.
              </Text>
            </Table.Th>
            <Table.Th style={{ width: 120, textAlign: 'right' }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Токены
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
