import { Gift, PartyPopper, Pencil, Trophy } from "lucide-react";
import type { GoalWithProgress } from "../../domain/goalBoard";
import { formatPoints } from "../../domain/points";
import { cn } from "../../lib/cn";
import { MemberMark } from "../members/MemberMark";
import { MemberPatternBar } from "../members/MemberPatternBar";
import { AvatarStack } from "../ui/AvatarStack";
import { IconButton } from "../ui/IconButton";
import { GOAL_STATUS_LABEL, goalWindowPhrase, hasOwnWindow, participantsLabel } from "./goalCopy";

interface GoalSummaryCardProps {
  item: GoalWithProgress;
  onEdit(): void;
  /** A closed estação is history: there is nothing left to adjust. */
  readOnly?: boolean;
}

/** Compact goal: who it is for, how many points it takes, what it pays. */
export function GoalSummaryCard({ item, onEdit, readOnly = false }: GoalSummaryCardProps) {
  const { goal, progress, season, members } = item;
  const who = participantsLabel(members);
  // A goal one person carries alone fills its bar with their texture. One
  // already batida stays green: that is what the colour is there to say.
  const soloist = members.length === 1 && !progress.reached ? members[0] : null;

  return (
    <li className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      {members.length === 0 ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-honey-100 text-honey-700"><Trophy className="size-5" /></span>
      ) : (
        <AvatarStack members={members} className="mt-0.5" />
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-honey-700">
          {members.length === 1 && <MemberMark member={members[0]} className="size-3.5" />}
          <span>{who} · {season.name}</span>
        </p>
        <p className="font-semibold">Meta: <span className="tabular-nums">{formatPoints(goal.targetPoints)}</span></p>
        <p className="flex items-start gap-1.5 text-sm text-ink-soft">
          <Gift className="mt-0.5 size-3.5 shrink-0 text-honey-700" aria-hidden />
          <span className="min-w-0">Recompensa: {goal.title}</span>
        </p>
        {hasOwnWindow(goal) && <p className="text-sm text-ink-soft">{goalWindowPhrase(goal, season)}</p>}
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-honey-100" role="progressbar" aria-valuemin={0} aria-valuemax={progress.target} aria-valuenow={progress.earned} aria-label={`Meta de ${who}: ${progress.earned} de ${progress.target} pontos`}>
          {soloist === null ? (
            <div className={cn("h-full rounded-full transition-[width] duration-500", progress.reached ? "bg-leaf-500" : "bg-honey-500")} style={{ width: `${progress.ratio * 100}%` }} />
          ) : (
            <MemberPatternBar member={soloist} ratio={progress.ratio} />
          )}
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          <span className="font-semibold text-ink tabular-nums">{progress.earned}</span> de {progress.target} pontos
          {progress.reached ? (
            <span className="ml-2 inline-flex items-center gap-1 font-semibold text-leaf-700"><PartyPopper className="size-3.5" /> batida</span>
          ) : (
            <span className="ml-2 text-ink-faint">{GOAL_STATUS_LABEL[progress.status]}</span>
          )}
        </p>
      </div>
      {!readOnly && (
        <IconButton label={`Ajustar meta: ${goal.title}`} icon={<Pencil className="size-4" />} onClick={onEdit} className="-mr-2 -mt-1" />
      )}
    </li>
  );
}
