import { Tabs, Badge, rem } from '@mantine/core';

interface TaskFiltersProps {
  activeTab: string;
  onChange: (value: string) => void;
}

export function TaskFilters({ activeTab, onChange }: TaskFiltersProps) {
  return (
    <Tabs value={activeTab} onChange={(value) => onChange(value || 'all')} variant="pills">
      <Tabs.List>
        <Tabs.Tab 
          value="all" 
          rightSection={
            <Badge size="sm" variant="filled" color="gray" circle>
              2
            </Badge>
          }
        >
          Все
        </Tabs.Tab>
        <Tabs.Tab 
          value="active"
          rightSection={
            <Badge size="sm" variant="filled" color="gray" circle>
              0
            </Badge>
          }
        >
          Активные
        </Tabs.Tab>
        <Tabs.Tab 
          value="success"
          rightSection={
            <Badge size="sm" variant="filled" color="gray" circle>
              2
            </Badge>
          }
        >
          Успешные
        </Tabs.Tab>
        <Tabs.Tab 
          value="failed"
          rightSection={
            <Badge size="sm" variant="filled" color="gray" circle>
              0
            </Badge>
          }
        >
          Упавшие
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
