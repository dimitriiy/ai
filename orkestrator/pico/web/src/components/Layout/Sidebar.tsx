import { Badge, Box, NavLink, Paper, Stack, Text } from '@mantine/core'
import { IconInbox, IconBrandGithub, IconCalendar } from '@tabler/icons-react'
import { useTasks } from '../../hooks/useTasks'
import { useRepo } from '../../hooks/useRepo'
import { countByFilter } from '../../lib/filters'
import { formatTokens } from '../Tasks/formatDuration'
import type { TaskView } from '@/types'

/** Суммарный расход токенов по задачам, обновлённым сегодня (локальный день). */
function todayTokens(tasks: TaskView[]): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const startMs = start.getTime()

  return tasks.reduce((acc, task) => {
    const updatedMs = new Date(task.updatedAt).getTime()
    if (!Number.isFinite(updatedMs) || updatedMs < startMs) return acc
    return acc + task.tokensInTotal + task.tokensOutTotal
  }, 0)
}

export function Sidebar() {
  const { tasks } = useTasks()
  const { repo } = useRepo()
  const counts = countByFilter(tasks)
  const tokens = todayTokens(tasks)

  return (
    <Stack
      gap="lg"
      p="md"
      h="100vh"
      style={{ borderRight: '1px solid var(--mantine-color-dark-4)' }}
    >
      {/* Logo */}
      <Box>
        <Text fw={700} size="xl" c="orange">
          PICO
        </Text>
      </Box>

      {/* Navigation */}
      <Box>
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          Навигация
        </Text>
        <NavLink
          label="Задачи"
          leftSection={<IconInbox size={20} />}
          rightSection={
            <Badge size="sm" variant="filled" color="gray">
              {counts.all}
            </Badge>
          }
          active
        />
      </Box>

      {/* Repositories */}
      <Box>
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          Репозитории
        </Text>
        <NavLink
          label={repo?.name ?? '…'}
          leftSection={<IconBrandGithub size={20} />}
          rightSection={
            <Badge size="sm" variant="filled" color="gray">
              {counts.all}
            </Badge>
          }
        />
      </Box>

      {/* Today's usage */}
      <Box mt="auto">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          Сегодня
        </Text>
        <Paper p="md" withBorder>
          <IconCalendar size={20} style={{ marginBottom: 8 }} />
          <Text size="lg" fw={700}>
            {formatTokens(tokens)} ток.
          </Text>
          <Text size="xs" c="dimmed">
            Расход
          </Text>
        </Paper>
      </Box>
    </Stack>
  )
}
