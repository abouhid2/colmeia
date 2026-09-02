import { CalendarDays, Repeat, ShieldCheck } from "lucide-react";
import { describeDue, type DueTone } from "../../domain/dueDates";
import { isRecurring, recurrenceLabel } from "../../domain/recurrence";
import type { Member, Task } from "../../domain/types";
import { useLagartinhasEnabled } from "../../hooks/useLagartinhas";
import { AvatarStack } from "../ui/AvatarStack";
import { Badge } from "../ui/Badge";
import { PriorityBadge } from "./PriorityBadge";

const DUE_TONES: Record<DueTone, string> = {
  overdue: "bg-berry-100 text-berry-700",
  today: "bg-honey-100 text-honey-700",
  soon: "bg-dune-100 text-dune-700",
  later: "bg-dune-100 text-dune-700",
};

interface TaskMetaProps {
  task: Task;
  /** Everybody the task is for. Empty means whoever gets to it first. */
  assignees: Member[];
  today: Date;
}

export function TaskMeta({ task, assignees, today }: TaskMetaProps) {
  const lagartinhasEnabled = useLagartinhasEnabled();
  const due = task.dueOn ? describeDue(task.dueOn, today) : null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PriorityBadge priority={task.priority} />
      {due && <Badge tone={DUE_TONES[due.tone]} icon={<CalendarDays className="size-3" />}>{due.label}</Badge>}
      {isRecurring(task.recurrence) && <Badge icon={<Repeat className="size-3" />}>{recurrenceLabel(task)}</Badge>}
      {task.requiresReview && <Badge tone="bg-lake-100 text-lake-700" icon={<ShieldCheck className="size-3" />}>Com avaliação</Badge>}
      {lagartinhasEnabled && task.kidFriendly && <Badge tone="bg-leaf-100 text-leaf-700" icon={<span aria-hidden>🐛</span>}>Para lagartinhas</Badge>}
      {assignees.length === 0 ? (
        <Badge tone="text-ink-faint">Quem pegar primeiro</Badge>
      ) : (
        <Badge tone="bg-surface border border-line text-ink" icon={<AvatarStack members={assignees} max={3} className="-ml-1.5" />}>
          {assigneesLabel(assignees)}
        </Badge>
      )}
    </div>
  );
}

/** One name reads as a name; a shared task says how many hands it has. */
function assigneesLabel(assignees: Member[]): string {
  const [ first ] = assignees;
  if (first === undefined) return "";
  return assignees.length === 1 ? first.name : `${assignees.length} pessoas`;
}
