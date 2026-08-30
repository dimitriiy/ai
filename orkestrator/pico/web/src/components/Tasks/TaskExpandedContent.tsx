import { Stack, Text, Code } from '@mantine/core'
import { type Task } from './types'

interface TaskExpandedContentProps {
  task: Task
}

export function TaskExpandedContent({ task }: TaskExpandedContentProps) {
  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        Task Details
      </Text>
      <Code block>
        {`Task #${task.number}: ${task.title}
Repository: ${task.repository}
Status: ${task.status}
Duration: ${task.duration}
Tokens: ${task.tokens}
${task.attempts ? `Attempts: ${task.attempts}` : ''}

Stages: ${task.completedStages}/${task.stages} completed

Mock log output:
Started: 2026-08-30 22:40:15
Completed: 2026-08-30 22:43:48
Branch: feature/task-${task.number}
Commit: 8a3f4e2

Stages:
1. ✓ Checkout code (5s)
2. ✓ Install dependencies (45s)
3. ✓ Run linter (12s)
4. ✓ Run tests (89s)
5. ✓ Build (54s)
6. ✓ Deploy to staging (28s)

Logs available at: /tasks/${task.number}/logs`}
      </Code>
    </Stack>
  )
}
