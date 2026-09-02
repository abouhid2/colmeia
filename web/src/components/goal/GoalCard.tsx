import { Gift, PartyPopper, Pencil } from "lucide-react";
import { formatPoints } from "../../domain/points";
import type { GoalWithProgress } from "../../hooks/useGoalOverview";
import { MemberMark } from "../members/MemberMark";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Honeycomb } from "./Honeycomb";
import { seasonEnding } from "./goalCopy";

interface GoalCardProps {
  item: GoalWithProgress;
  onEdit(): void;
  /** A closed estação is history: there is nothing left to adjust. */
  readOnly?: boolean;
}

/** The colmeia's goal: how many points to reach, then what reaching it pays. */
export function GoalCard({ item, onEdit, readOnly = false }: GoalCardProps) {
  const { goal, progress, season, standings } = item;
  const contributors = standings.filter((standing) => standing.points > 0);
  const contributions = contributors.map(({ member, points }) => ({ memberId: member.id, points }));
  const summary = `${progress.earned} de ${progress.target} pontos`;

  return (
    <Card className="p-5 md:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">
            Meta da estação · {season.name} · {seasonEnding(season)}
          </p>
          <h2 className="mt-1 text-4xl font-bold leading-tight tracking-tight tabular-nums md:text-5xl">
            {formatPoints(progress.target)}
          </h2>
          <p className="text-ink-soft">para juntar nesta estação</p>
        </div>
        {!readOnly && <Button variant="ghost" size="sm" icon={<Pencil className="size-4" />} onClick={onEdit}>Ajustar meta</Button>}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-card border border-line bg-paper p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-honey-100 text-honey-700">
          <Gift className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">Recompensa</p>
          <p className="font-display text-lg font-bold leading-snug md:text-xl">{goal.title}</p>
        </div>
      </div>

      <div className="my-6">
        <Honeycomb
          earned={progress.earned}
          target={progress.target}
          label={`Favo da meta: ${summary}`}
          contributions={contributions}
          members={contributors.map(({ member }) => member)}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <p>
          <span className="font-display text-3xl font-bold tabular-nums md:text-4xl">{progress.earned}</span>
          <span className="text-ink-soft"> de {progress.target} pontos</span>
        </p>
        {progress.reached ? (
          <p className="flex items-start gap-1.5 font-semibold text-leaf-700">
            <PartyPopper className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Meta batida. A recompensa é de vocês: {goal.title}.</span>
          </p>
        ) : (
          <p className="text-ink-soft">Faltam <span className="font-semibold text-ink">{progress.remaining}</span> pontos</p>
        )}
      </div>

      {contributors.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Quem já ajudou">
          {contributors.map(({ member, points }) => (
            <li key={member.id} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-3 text-sm">
              <MemberMark member={member} className="size-4" />
              <Avatar member={member} size="xs" />
              <span className="font-medium">{member.name}</span>
              <span className="tabular-nums text-ink-soft">{points}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
