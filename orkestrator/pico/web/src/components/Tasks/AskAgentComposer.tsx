// AskAgentComposer — UI-only stub, бэкенд-эндпоинт не реализован.
import { useState } from 'react'
import { Box, Collapse, Group, Text, Textarea } from '@mantine/core'
import { IconChevronRight, IconBulb } from '@tabler/icons-react'
import type { AgentInfo } from './AgentBadge'

interface Props {
  agent?: AgentInfo | null
  stageLabel: string
}

export function AskAgentComposer({ agent, stageLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const agentName = agent?.name ?? 'агента'

  return (
    <Box style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 14px',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
        }}
      >
        <IconBulb size={13} color="var(--mantine-color-violet-4)" />
        <Text size="xs" fw={600} tt="uppercase" style={{ letterSpacing: '.06em', color: 'var(--mantine-color-dimmed)' }}>
          Спросить у агента
        </Text>
        <span style={{ flex: 1 }} />
        <IconChevronRight
          size={13}
          style={{
            color: 'var(--mantine-color-dimmed)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform .18s ease',
          }}
        />
      </Box>

      <Collapse expanded={open}>
        <Box px={14} pb={12}>
          <Text size="xs" c="dimmed" mb={8}>
            контекст стадии{' '}
            <Text span size="xs" ff="monospace" c="var(--mantine-color-gray-4)">
              {stageLabel}
            </Text>{' '}
            прикладывается автоматически
          </Text>
          <Box
            style={{
              border: '1px solid var(--mantine-color-dark-3)',
              borderRadius: 6,
              background: 'var(--mantine-color-dark-8)',
              padding: 10,
            }}
          >
            <Textarea
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              placeholder={`Уточнить у ${agentName} — что именно сделано и почему`}
              minRows={3}
              autosize
              styles={{
                input: {
                  background: 'transparent',
                  border: 0,
                  padding: 0,
                  fontSize: 13,
                },
              }}
            />
            <Group justify="space-between" mt={8} pt={8} style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
              <Text size="xs" c="dimmed">⌘+Enter — отправить</Text>
              <Box
                component="button"
                type="button"
                disabled
                title="скоро будет"
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: 'var(--mantine-color-violet-7)',
                  color: '#fff',
                  border: 0,
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                Отправить
              </Box>
            </Group>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}
