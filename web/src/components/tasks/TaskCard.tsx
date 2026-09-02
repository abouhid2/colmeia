import { Check, Pencil } from "lucide-react";
import type { Member, Task } from "../../domain/types";
import { IconButton } from "../ui/IconButton";
import { PointsBadge } from "../ui/PointsBadge";
import { TaskDescription } from "./TaskDescription";
import { TaskMeta } from "./TaskMeta";

interface TaskCardProps {
  task: Task;
  assignees: Member[];
  today: Date;
  onComplete(task: Task): void;
  onEdit(task: Task): void;
  /** A closed estação scores nothing more, so there is nothing to tick off. */
  readOnly?: boolean;
}

export function TaskCard({ task, assignees, today, onComplete, onEdit, readOnly = false }: TaskCardProps) {
  return (
    <article className="flex gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      {!readOnly && (
        <button
          type="button"
          onClick={() => onComplete(task)}
          aria-label={`Concluir: ${task.title}`}
          className="group mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-2 border-line-strong text-transparent transition-colors hover:border-honey-500 hover:bg-honey-100 hover:text-honey-700 focus-visible:border-honey-500"
        >
          <Check className="size-5" strokeWidth={3} />
        </button>
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{task.title}</h3>
          <PointsBadge points={task.points} size="sm" />
        </div>
        {task.description && <TaskDescription text={task.description} />}
        <TaskMeta task={task} assignees={assignees} today={today} />
      </div>
      <IconButton label={`Editar: ${task.title}`} icon={<Pencil className="size-4" />} onClick={() => onEdit(task)} className="-mr-2 -mt-1" />
    </article>
  );
}
