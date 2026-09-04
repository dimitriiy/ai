import { Badge, Tabs } from '@mantine/core'
import type { TaskFilter } from '@/lib/filters'
import { TASK_FILTERS } from '@/lib/filters'

interface TaskFiltersProps {
  value: TaskFilter
  onChange: (value: TaskFilter) => void
  counts: Record<TaskFilter, number>
}

export function TaskFilters({ value, onChange, counts }: TaskFiltersProps) {
  return (
    <Tabs
      value={value}
      onChange={(next) => onChange((next as TaskFilter) ?? 'all')}
      variant="pills"
    >
      <Tabs.List>
        {TASK_FILTERS.map((filter) => (
          <Tabs.Tab
            key={filter.value}
            value={filter.value}
            rightSection={
              <Badge
                size="sm"
                variant="filled"
                color={
                  filter.value === 'blocked' && counts.blocked > 0
                    ? 'orange'
                    : 'gray'
                }
                circle
              >
                {counts[filter.value]}
              </Badge>
            }
          >
            {filter.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  )
}
