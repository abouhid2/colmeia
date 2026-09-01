import { Check, RotateCcw } from "lucide-react";
import type { Task } from "../../domain/types";
import { timeAgo } from "../../lib/dates";
import { IconButton } from "../ui/IconButton";
import { PointsBadge } from "../ui/PointsBadge";

interface DoneTaskRowProps {
  task: Task;
  onReopen(task: Task): void;
}

export function DoneTaskRow({ task, onReopen }: DoneTaskRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-surface/60 px-4 py-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700"><Check className="size-4" strokeWidth={3} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-soft line-through decoration-line-strong">{task.title}</p>
        {task.completedAt && <p className="text-xs text-ink-faint">Concluída {timeAgo(task.completedAt)}</p>}
      </div>
      <PointsBadge points={task.points} size="sm" muted />
      <IconButton label={`Reabrir: ${task.title}`} icon={<RotateCcw className="size-4" />} onClick={() => onReopen(task)} />
    </li>
  );
}
