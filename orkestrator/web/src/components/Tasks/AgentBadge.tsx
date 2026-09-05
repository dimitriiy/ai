import { Group, Text } from '@mantine/core'
import { IconSparkles } from '@tabler/icons-react'

export interface AgentInfo {
  name?: string | null
  model?: string | null
}

interface Props {
  agent: AgentInfo
}

export function AgentBadge({ agent }: Props) {
  return (
    <Group
      gap={6}
      px={8}
      py={3}
      style={{
        borderRadius: 999,
        border: '1px solid var(--mantine-color-dark-4)',
        background: 'var(--mantine-color-dark-7)',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'var(--mantine-color-violet-6)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <IconSparkles size={10} color="#fff" />
      </span>
      {agent.name && (
        <Text size="xs" fw={500}>
          {agent.name}
        </Text>
      )}
      {agent.model && (
        <>
          <Text size="xs" c="dimmed">
            ·
          </Text>
          <Text size="xs" ff="monospace" c="dimmed">
            {agent.model}
          </Text>
        </>
      )}
    </Group>
  )
}
