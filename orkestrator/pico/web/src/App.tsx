import { useState } from 'react'
import { Box, Stack, ScrollArea, Group, Button } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from './components/Layout/AppLayout'
import { TaskFilters } from './components/Tasks/TaskFilters'
import { TasksTable } from './components/Tasks/TasksTable'
import { useTasks } from './hooks/useTasks'
import { clearAllTasks } from './api'
import type { TaskFilter } from './lib/filters'
import { countByFilter } from './lib/filters'

export default function App() {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const { tasks } = useTasks()
  const queryClient = useQueryClient()
  const counts = countByFilter(tasks)

  const handleClearAll = async () => {
    await clearAllTasks()
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  return (
    <AppLayout>
      <Box p="md">
        <Stack gap="lg">
          <Group justify="space-between">
            <TaskFilters value={filter} onChange={setFilter} counts={counts} />
            <Button color="red" variant="light" onClick={handleClearAll}>
              Сбросить прогресс
            </Button>
          </Group>
          <ScrollArea>
            <TasksTable tasks={tasks} />
          </ScrollArea>
        </Stack>
      </Box>
    </AppLayout>
  )
}
