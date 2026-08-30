import {
  Breadcrumbs,
  Button,
  Group,
  TextInput,
  Anchor,
  Box,
} from '@mantine/core'
import {
  IconSearch,
  IconGitPullRequest,
  IconPlayerPlay,
} from '@tabler/icons-react'

export function Header() {
  return (
    <Box
      p="md"
      style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
    >
      <Group justify="space-between" align="center">
        {/* Left: Breadcrumbs + Search */}
        <Group gap="xl">
          <Breadcrumbs separator="•">
            <Anchor c="dimmed" size="sm">
              Задачи
            </Anchor>
            <Anchor c="white" size="sm">
              все репозитории
            </Anchor>
          </Breadcrumbs>

          <TextInput
            placeholder="Поиск по задачам..."
            leftSection={<IconSearch size={16} />}
            w={300}
            variant="filled"
          />
        </Group>

        {/* Right: Buttons */}
        <Group gap="sm">
          <Button
            variant="default"
            leftSection={<IconGitPullRequest size={16} />}
          >
            Pull
          </Button>
          <Button color="violet" leftSection={<IconPlayerPlay size={16} />}>
            Run
          </Button>
        </Group>
      </Group>
    </Box>
  )
}
