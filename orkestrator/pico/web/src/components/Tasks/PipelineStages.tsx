import { Box, Group } from '@mantine/core';

interface PipelineStagesProps {
  stages: number;
  completedStages: number;
}

export function PipelineStages({ stages, completedStages }: PipelineStagesProps) {
  return (
    <Group gap={8} wrap="nowrap">
      {Array.from({ length: stages }).map((_, index) => (
        <Box key={index} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Circle */}
          <Box
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: index < completedStages ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-dark-4)',
              zIndex: 2,
            }}
          />
          
          {/* Line to next stage */}
          {index < stages - 1 && (
            <Box
              style={{
                width: 24,
                height: 2,
                backgroundColor: index < completedStages - 1 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-dark-4)',
                marginLeft: 2,
                marginRight: -2,
              }}
            />
          )}
        </Box>
      ))}
    </Group>
  );
}
