import { CalendarClock, Pencil } from "lucide-react";
import { formatPoints } from "../../domain/points";
import type { GoalWithProgress } from "../../domain/goalBoard";
import { Card } from "../ui/Card";
import { IconButton } from "../ui/IconButton";
import { goalOpeningPhrase, goalWindowPhrase } from "./goalCopy";

interface GoalUpcomingCardProps {
  item: GoalWithProgress;
  now: Date;
  onEdit(): void;
  readOnly?: boolean;
}

/** Nothing running today, but something is on the way: this says how long the wait is. */
export function GoalUpcomingCard({ item, now, onEdit, readOnly = false }: GoalUpcomingCardProps) {
  const { goal, season } = item;
  const opening = goalOpeningPhrase(goal.startsOn ?? season.startsOn, now);

  return (
    <Card className="flex items-start gap-4 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-dune-100 text-dune-700">
        <CalendarClock className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">Próxima meta {opening}</p>
        <p className="font-display text-lg font-bold leading-snug">{goal.title}</p>
        <p className="mt-0.5 text-sm text-ink-soft">
          <span className="tabular-nums">{formatPoints(goal.targetPoints)}</span> · {goalWindowPhrase(goal, season)}
        </p>
      </div>
      {!readOnly && <IconButton label={`Ajustar meta: ${goal.title}`} icon={<Pencil className="size-4" />} onClick={onEdit} className="-mr-2 -mt-1" />}
    </Card>
  );
}
