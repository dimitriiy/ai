import { useState } from 'react'
import { Anchor, Box, Code, Group, Stack, Text } from '@mantine/core'
import { IconFile } from '@tabler/icons-react'

const TEXT_PREVIEW_LINES = 8

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

function scalarToString(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function TextBlock({ label, text }: { label?: string; text: string }) {
  const [open, setOpen] = useState(false)
  const lines = text.split('\n')
  const isLong = lines.length > TEXT_PREVIEW_LINES || text.length > 400

  return (
    <Box>
      {label && (
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
          {label}
        </Text>
      )}
      <Code
        block
        fz={11}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {open || !isLong ? text : lines.slice(0, TEXT_PREVIEW_LINES).join('\n')}
      </Code>
      {isLong && (
        <Anchor
          component="button"
          type="button"
          size="xs"
          mt={4}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'свернуть' : 'показать целиком'}
        </Anchor>
      )}
    </Box>
  )
}

function FileList({ label, items }: { label?: string; items: string[] }) {
  return (
    <Box>
      {label && (
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
          {label}
        </Text>
      )}
      <Stack gap={2}>
        {items.map((item, i) => (
          <Group key={`${i}-${item}`} gap={6} wrap="nowrap">
            <IconFile size={12} color="var(--mantine-color-dimmed)" />
            <Text size="xs" ff="monospace" truncate title={item}>
              {item}
            </Text>
          </Group>
        ))}
      </Stack>
    </Box>
  )
}

function KeyValues({ items }: { items: [string, unknown][] }) {
  return (
    <Stack gap={4}>
      {items.map(([key, value]) => (
        <Group key={key} gap="md" wrap="nowrap" align="baseline">
          <Text
            size="xs"
            c="dimmed"
            ff="monospace"
            w={110}
            style={{ flexShrink: 0 }}
          >
            {key}
          </Text>
          <Text
            size="xs"
            ff="monospace"
            truncate
            title={scalarToString(value)}
            style={{ flex: 1, minWidth: 0 }}
          >
            {scalarToString(value)}
          </Text>
        </Group>
      ))}
    </Stack>
  )
}

/**
 * Рендерит произвольный payload стадии: длинные строки — блоками текста,
 * массивы строк — списком файлов, остальное — парами ключ/значение.
 */
export function StageIO({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return (
      <Text size="xs" c="dimmed">
        нет данных
      </Text>
    )
  }

  if (typeof data === 'string') {
    return data.length > 0 ? (
      <TextBlock text={data} />
    ) : (
      <Text size="xs" c="dimmed">
        пусто
      </Text>
    )
  }

  if (isStringArray(data)) return <FileList items={data} />

  if (!isPlainObject(data)) {
    return <TextBlock text={scalarToString(data)} />
  }

  const entries = Object.entries(data)
  if (entries.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        нет данных
      </Text>
    )
  }

  const scalars: [string, unknown][] = []
  const blocks: React.ReactNode[] = []

  for (const [key, value] of entries) {
    if (typeof value === 'string' && (value.length > 80 || value.includes('\n'))) {
      blocks.push(<TextBlock key={key} label={key} text={value} />)
    } else if (isStringArray(value) && value.length > 0) {
      blocks.push(<FileList key={key} label={key} items={value} />)
    } else if (isPlainObject(value) || Array.isArray(value)) {
      blocks.push(
        <TextBlock key={key} label={key} text={JSON.stringify(value, null, 2)} />,
      )
    } else {
      scalars.push([key, value])
    }
  }

  return (
    <Stack gap="sm">
      {scalars.length > 0 && <KeyValues items={scalars} />}
      {blocks}
    </Stack>
  )
}
