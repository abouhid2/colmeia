import type { Member, Task } from "../../domain/types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  today: Date;
  lookup(id: number | null): Member | null;
  onComplete(task: Task): void;
  onEdit(task: Task): void;
  readOnly?: boolean;
}

export function TaskList({ tasks, today, lookup, onComplete, onEdit, readOnly = false }: TaskListProps) {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} assignee={lookup(task.assigneeId)} today={today} onComplete={onComplete} onEdit={onEdit} readOnly={readOnly} />
        </li>
      ))}
    </ul>
  );
}
