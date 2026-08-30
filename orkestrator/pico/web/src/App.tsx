import { useState } from 'react'
import { Box, Stack, ScrollArea } from '@mantine/core'
import { AppLayout } from './components/Layout/AppLayout'
import { TaskFilters } from './components/Tasks/TaskFilters'
import { TasksTable } from './components/Tasks/TasksTable'
import { mockTasks } from './data/mockTasks'

export default function App() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <AppLayout>
      <Box p="md">
        <Stack gap="lg">
          <TaskFilters activeTab={activeTab} onChange={setActiveTab} />
          <ScrollArea>
            <TasksTable tasks={mockTasks} />
          </ScrollArea>
        </Stack>
      </Box>
    </AppLayout>
  )
}
