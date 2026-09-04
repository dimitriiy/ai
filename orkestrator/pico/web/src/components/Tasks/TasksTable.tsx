import { Box, Table, Text } from '@mantine/core'
import type { TaskView } from '@/types'
import { TaskRow } from './TaskRow'

interface TasksTableProps {
  tasks: TaskView[]
  /** Что показать вместо строк — текст зависит от того, есть ли фильтр. */
  empty?: React.ReactNode
}

const COLUMNS = [
  { key: 'expand', title: '', width: 40 },
  { key: 'status', title: 'Статус', width: 120 },
  { key: 'task', title: 'Задача', width: undefined },
  { key: 'stages', title: 'Стадии', width: 260 },
  { key: 'duration', title: 'Длит.', width: 110 },
  { key: 'actions', title: '', width: 130 },
]

export function TasksTable({ tasks, empty }: TasksTableProps) {
  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr
            style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
          >
            {COLUMNS.map((column) => (
              <Table.Th key={column.key} style={{ width: column.width }}>
                {column.title && (
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    {column.title}
                  </Text>
                )}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tasks.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={COLUMNS.length}>
                <Box py="xl" ta="center">
                  {empty ?? (
                    <Text size="sm" c="dimmed">
                      Задач нет
                    </Text>
                  )}
                </Box>
              </Table.Td>
            </Table.Tr>
          ) : (
            tasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
