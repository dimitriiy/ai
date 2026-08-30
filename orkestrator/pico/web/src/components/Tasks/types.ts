export interface Task {
  id: string;
  number: number;
  title: string;
  repository: string;
  status: 'done' | 'running' | 'failed';
  stages: number;
  completedStages: number;
  duration: string;
  tokens: string;
  attempts?: number;
}
