import { PartyPopper, Pencil, Trophy } from "lucide-react";
import type { GoalWithProgress } from "../../hooks/useGoalOverview";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { IconButton } from "../ui/IconButton";
import { periodScopeLabel } from "./goalCopy";

interface GoalSummaryCardProps {
  item: GoalWithProgress;
  onEdit(): void;
}

/** Compact goal: who it belongs to, what it pays, how close it is. */
export function GoalSummaryCard({ item, onEdit }: GoalSummaryCardProps) {
  const { goal, progress, member } = item;
  return (
    <li className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      {member ? (
        <Avatar member={member} size="md" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-honey-100 text-honey-700"><Trophy className="size-5" /></span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">
          {member ? member.name : "Toda a casa"} · {periodScopeLabel(goal.period)}
        </p>
        <p className="truncate font-semibold">{goal.title}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-honey-100" role="progressbar" aria-valuemin={0} aria-valuemax={progress.target} aria-valuenow={progress.earned} aria-label={`${goal.title}: ${progress.earned} de ${progress.target} pontos`}>
          <div className={cn("h-full rounded-full transition-[width] duration-500", progress.reached ? "bg-leaf-500" : "bg-honey-500")} style={{ width: `${progress.ratio * 100}%` }} />
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          <span className="font-semibold text-ink tabular-nums">{progress.earned}</span> de {progress.target} pontos
          {progress.reached && <span className="ml-2 inline-flex items-center gap-1 font-semibold text-leaf-700"><PartyPopper className="size-3.5" /> batida</span>}
        </p>
      </div>
      <IconButton label={`Ajustar meta: ${goal.title}`} icon={<Pencil className="size-4" />} onClick={onEdit} className="-mr-2 -mt-1" />
    </li>
  );
}
