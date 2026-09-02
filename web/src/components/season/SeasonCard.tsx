import { Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { seasonRange } from "../goal/goalCopy";
import { Badge } from "../ui/Badge";
import { SeasonActions } from "./SeasonActions";

interface SeasonCardProps {
  season: Season;
  /** Approved points scored inside it. */
  points: number;
  isCurrent: boolean;
  confirmingDelete: boolean;
  onEdit(): void;
  onClose(): void;
  onReopen(): void;
  onDelete(): void;
  /** The roteiro of this estação, when it has metas worth drawing. */
  roadmap?: ReactNode;
}

export function SeasonCard({ season, points, isCurrent, confirmingDelete, onEdit, onClose, onReopen, onDelete, roadmap }: SeasonCardProps) {
  const { search } = useLocation();
  const to = { pathname: `/estacoes/${season.id}`, search };

  return (
    <li className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight">
              <Link to={to} className="hover:underline">{season.name}</Link>
            </h3>
            {isClosed(season) ? (
              <Badge>Encerrada</Badge>
            ) : (
              <Badge tone="bg-leaf-100 text-leaf-700">Em andamento</Badge>
            )}
            {isCurrent && <Badge tone="bg-honey-100 text-honey-700" icon={<Check className="size-3" />}>Você está aqui</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{seasonRange(season)}</p>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="font-semibold text-ink tabular-nums">{season.tasksCount}</span> {season.tasksCount === 1 ? "tarefa" : "tarefas"}
            <span className="px-1.5 text-ink-faint">·</span>
            <span className="font-semibold text-ink tabular-nums">{season.completionsCount}</span> {season.completionsCount === 1 ? "conclusão" : "conclusões"}
            <span className="px-1.5 text-ink-faint">·</span>
            <span className="font-semibold text-ink tabular-nums">{points}</span> pontos
          </p>
        </div>
        <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
          Ver esta estação <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      {roadmap && <div className="mt-4 border-t border-line pt-3">{roadmap}</div>}

      <div className="mt-4 border-t border-line pt-3">
        <SeasonActions
          season={season}
          confirmingDelete={confirmingDelete}
          onEdit={onEdit}
          onClose={onClose}
          onReopen={onReopen}
          onDelete={onDelete}
        />
      </div>
    </li>
  );
}
