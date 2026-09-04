import { useState } from 'react'
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
import {
  IconBrandGithub,
  IconExternalLink,
  IconGitBranch,
  IconHandStop,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Stage, TaskEvent, TaskView } from '@/types'
import { resumeTask } from '@/api'
import { defaultStage, stageDetail } from '@/lib/liveTask'
import { issueUrl, MOCK_REPO, taskTokens, tokensToUsd } from '@/lib/mock'
import { PipelineStages } from './PipelineStages'
import { StageDetail } from './StageDetail'
import { formatTokens, formatUsd } from './formatDuration'

interface TaskExpandedContentProps {
  /** Задача уже с накатанным потоком — приходит из TaskRow. */
  task: TaskView
  events: TaskEvent[]
  connected: boolean
}

function Meta({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Box>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={2}>
        {label}
      </Text>
      {children}
    </Box>
  )
}

function Mono({ value }: { value: string | null | undefined }) {
  if (!value) {
    return (
      <Text size="xs" c="dimmed">
        —
      </Text>
    )
  }
  return (
    <Text size="xs" ff="monospace" truncate title={value}>
      {value}
    </Text>
  )
}

export function TaskExpandedContent({
  task,
  events,
  connected,
}: TaskExpandedContentProps) {
  const queryClient = useQueryClient()

  // null = «пользователь ещё не выбирал», и тогда стадию подбираем сами.
  // Как только выбрал — держим выбор, даже если пайплайн уехал дальше.
  const [picked, setPicked] = useState<Stage | null>(null)
  const activeStage = picked ?? defaultStage(task)
  const stage =
    task.stages.find((s) => s.stage === activeStage) ?? task.stages[0]

  const { mutate: resume, isPending: isResuming } = useMutation({
    mutationFn: () => resumeTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', task.id] })
    },
  })

  const tokens = taskTokens(task)
  const questions = stageDetail(events, 'plan').questions

  return (
    <Stack gap="md">
      {task.status === 'blocked' && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconHandStop size={16} />}
          title="Агент ждёт ответа человека"
        >
          <Stack gap="xs" align="flex-start">
            {questions && (
              <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
                {questions}
              </Text>
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

      <Paper withBorder p="md">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          <Meta label="Репозиторий">
            <Group gap={6} wrap="nowrap">
              <IconBrandGithub size={12} />
              <Mono value={MOCK_REPO} />
            </Group>
          </Meta>

          <Meta label="Issue">
            <Anchor
              href={issueUrl(task)}
              target="_blank"
              rel="noreferrer"
              size="xs"
            >
              <Group gap={4} wrap="nowrap">
                <span>#{task.issueNumber}</span>
                <IconExternalLink size={11} />
              </Group>
            </Anchor>
          </Meta>

          <Meta label="Ветка">
            <Group gap={6} wrap="nowrap">
              <IconGitBranch size={12} />
              <Mono value={task.branch} />
            </Group>
          </Meta>

          <Meta label="Pull request">
            {task.prUrl ? (
              <Anchor href={task.prUrl} target="_blank" rel="noreferrer" size="xs">
                <Group gap={4} wrap="nowrap">
                  <span>открыть PR</span>
                  <IconExternalLink size={11} />
                </Group>
              </Anchor>
            ) : (
              <Text size="xs" c="dimmed">
                ещё нет
              </Text>
            )}
          </Meta>

          <Meta label="Worktree">
            <Mono value={task.worktreePath} />
          </Meta>

          <Meta label="Попыток">
            <Text size="xs">{task.attempts}</Text>
          </Meta>

          <Meta label="Токены">
            <Text size="xs">
              {formatTokens(tokens)}{' '}
              <Text span size="xs" c="dimmed">
                ≈ {formatUsd(tokensToUsd(tokens))}
              </Text>
            </Text>
          </Meta>

          <Meta label="Поток">
            <Badge
              size="xs"
              variant="light"
              color={connected ? 'green' : 'gray'}
            >
              {connected ? '● live' : '○ offline'}
            </Badge>
          </Meta>
        </SimpleGrid>
      </Paper>

      <Paper withBorder p="md">
        <Box style={{ overflowX: 'auto' }}>
          <PipelineStages
            stages={task.stages}
            size="lg"
            showLabels
            selected={activeStage}
            onSelect={setPicked}
          />
        </Box>
      </Paper>

      {stage && (
        <StageDetail
          key={stage.stage}
          taskId={task.id}
          stage={stage}
          events={events}
        />
      )}
    </Stack>
  )
}
