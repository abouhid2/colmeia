import { PartyPopper, Pencil } from "lucide-react";
import type { Standing } from "../../domain/leaderboard";
import type { GoalProgress } from "../../domain/progress";
import type { Goal } from "../../domain/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Honeycomb } from "./Honeycomb";
import { periodEnding, periodTitle } from "./goalCopy";

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress;
  standings: Standing[];
  onEdit(): void;
}

export function GoalCard({ goal, progress, standings, onEdit }: GoalCardProps) {
  const contributors = standings.filter((standing) => standing.points > 0);
  const summary = `${progress.earned} de ${progress.target} pontos`;

  return (
    <Card className="p-5 md:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">
            {periodTitle(goal.period)} · {periodEnding(progress.bounds)}
          </p>
          <h2 className="mt-1 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{goal.title}</h2>
        </div>
        <Button variant="ghost" size="sm" icon={<Pencil className="size-4" />} onClick={onEdit}>Ajustar</Button>
      </div>

      <div className="my-6">
        <Honeycomb earned={progress.earned} target={progress.target} label={`Progresso da meta: ${summary}`} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <p>
          <span className="font-display text-4xl font-bold tabular-nums">{progress.earned}</span>
          <span className="text-ink-soft"> de {progress.target} pontos</span>
        </p>
        {progress.reached ? (
          <p className="inline-flex items-center gap-1.5 font-semibold text-leaf-700">
            <PartyPopper className="size-4" aria-hidden /> Meta batida. A recompensa está garantida.
          </p>
        ) : (
          <p className="text-ink-soft">Faltam <span className="font-semibold text-ink">{progress.remaining}</span> pontos</p>
        )}
      </div>

      {contributors.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Quem já contribuiu">
          {contributors.map(({ member, points }) => (
            <li key={member.id} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-3 text-sm">
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
