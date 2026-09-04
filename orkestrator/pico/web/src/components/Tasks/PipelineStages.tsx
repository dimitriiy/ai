import { Box, Group, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { CSSProperties } from 'react'
import type { Stage, StageView } from '@/types'
import { STAGE_TITLE } from '@/types'
import { formatDuration } from './formatDuration'
import { getStatusColor } from './statusColor'
import styles from './PipelineStages.module.css'

interface PipelineStagesProps {
  stages: StageView[]
  /** Крупный вариант с подписями — для развёрнутой карточки. */
  size?: 'sm' | 'lg'
  showLabels?: boolean
  selected?: Stage | null
  onSelect?: (stage: Stage) => void
}

const SIZES = {
  sm: { dot: 16, gap: 24, icon: 10 },
  lg: { dot: 22, gap: 48, icon: 13 },
} as const

export function PipelineStages({
  stages,
  size = 'sm',
  showLabels = false,
  selected = null,
  onSelect,
}: PipelineStagesProps) {
  if (!stages?.length) return null

  const dims = SIZES[size]
  const clickable = typeof onSelect === 'function'

  return (
    <Group gap={0} wrap="nowrap" align="flex-start">
      {stages.map((stage, index) => {
        const isSelected = selected === stage.stage
        const isRunning = stage.status === 'running'

        const dotStyle: CSSProperties = {
          width: dims.dot,
          height: dims.dot,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getStatusColor(stage.status),
          // Обводка выбранной стадии лежит снаружи кружка, чтобы читаться
          // на любом цвете статуса.
          outline: isSelected
            ? '2px solid var(--mantine-color-violet-4)'
            : 'none',
          outlineOffset: 2,
          zIndex: 2,
          ...(isRunning
            ? ({ '--pulse-color': 'var(--mantine-color-yellow-4)' } as CSSProperties)
            : {}),
        }

        const dot = (
          <Box className={isRunning ? styles.running : undefined} style={dotStyle}>
            {stage.status === 'done' && (
              <IconCheck size={dims.icon} color="white" stroke={3} />
            )}
            {stage.status === 'failed' && (
              <IconX size={dims.icon} color="white" stroke={3} />
            )}
          </Box>
        )

        return (
          <Stack key={stage.stage} gap={4} align="center">
            <Group gap={0} wrap="nowrap" align="center">
              <Tooltip
                label={`${STAGE_TITLE[stage.stage] ?? stage.stage} — ${stage.status}`}
                withArrow
                disabled={showLabels}
              >
                {clickable ? (
                  <UnstyledButton
                    aria-label={stage.stage}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect?.(stage.stage)
                    }}
                    style={{ lineHeight: 0 }}
                  >
                    {dot}
                  </UnstyledButton>
                ) : (
                  dot
                )}
              </Tooltip>

              {index < stages.length - 1 && (
                <Box
                  style={{
                    width: dims.gap,
                    height: 2,
                    backgroundColor:
                      stage.status === 'done'
                        ? 'var(--mantine-color-green-6)'
                        : 'var(--mantine-color-dark-4)',
                  }}
                />
              )}
            </Group>

            {/* Подписи центрируются под кружком: коннектор уходит вправо,
                поэтому его ширину компенсируем отступом. */}
            <Stack
              gap={0}
              align="center"
              style={{
                marginRight: index < stages.length - 1 ? dims.gap : 0,
              }}
            >
              {showLabels && (
                <Text
                  fz={10}
                  fw={isSelected ? 700 : 400}
                  c={isSelected ? 'violet.4' : 'dimmed'}
                  style={{ lineHeight: 1.4, whiteSpace: 'nowrap' }}
                >
                  {stage.stage}
                </Text>
              )}
              <Text
                fz={9}
                c="dimmed"
                style={{ lineHeight: 1.4, whiteSpace: 'nowrap' }}
              >
                {stage.durationMs !== null
                  ? formatDuration(stage.durationMs)
                  : ' '}
              </Text>
            </Stack>
          </Stack>
        )
      })}
    </Group>
  )
}
