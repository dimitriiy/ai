import { useTask } from '../hooks/useTask'
import TaskView from '../TaskView'

interface Props {
  id: string | number
}

export default function TaskCard({ id }: Props) {
  const { task, loading, error } = useTask(id)

  if (loading) return <div style={{ padding: '12px', color: '#8b949e' }}>Loading #{id}...</div>
  if (error) return <div style={{ padding: '12px', color: '#f85149' }}>Error: {error.message}</div>
  if (!task) return null

  return <TaskView task={task} />
}
