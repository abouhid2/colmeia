import { Check, LockOpen, Pencil, Square, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { seasonRange } from "../goal/goalCopy";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface SeasonCardProps {
  season: Season;
  /** Approved points scored inside it. */
  points: number;
  isCurrent: boolean;
  confirmingDelete: boolean;
  onSelect(): void;
  onEdit(): void;
  onClose(): void;
  onReopen(): void;
  onDelete(): void;
  /** The roteiro of this estação, when it has metas worth drawing. */
  roadmap?: ReactNode;
}

export function SeasonCard({ season, points, isCurrent, confirmingDelete, onSelect, onEdit, onClose, onReopen, onDelete, roadmap }: SeasonCardProps) {
  const closed = isClosed(season);
  const canDelete = season.completionsCount === 0;

  return (
    <li className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight">{season.name}</h3>
            {closed ? (
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
        {!isCurrent && <Button variant="secondary" size="sm" onClick={onSelect}>Ver esta estação</Button>}
      </div>

      {roadmap && <div className="mt-4 border-t border-line pt-3">{roadmap}</div>}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
        <Button variant="ghost" size="sm" icon={<Pencil className="size-4" />} onClick={onEdit}>Ajustar</Button>
        {closed ? (
          <Button variant="ghost" size="sm" icon={<LockOpen className="size-4" />} onClick={onReopen}>Reabrir</Button>
        ) : (
          <Button variant="ghost" size="sm" icon={<Square className="size-4" />} onClick={onClose}>Encerrar</Button>
        )}
        {canDelete && (
          <Button
            variant={confirmingDelete ? "danger" : "ghost"}
            size="sm"
            icon={<Trash2 className="size-4" />}
            onClick={onDelete}
          >
            {confirmingDelete ? "Confirmar exclusão" : "Excluir"}
          </Button>
        )}
      </div>
    </li>
  );
}
