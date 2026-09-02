import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import type { SeasonTitle } from "../../domain/types";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

interface SeasonTitleRowProps {
  title: SeasonTitle;
  /** The crown is renamed like the others, but never moved or dropped. */
  isCrown: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  confirmingDelete: boolean;
  onEdit(): void;
  onMove(step: -1 | 1): void;
  onDelete(): void;
}

export function SeasonTitleRow({ title, isCrown, canMoveUp, canMoveDown, confirmingDelete, onEdit, onMove, onDelete }: SeasonTitleRowProps) {
  return (
    <li className="flex items-start gap-3 rounded-card border border-line bg-surface p-3">
      <span aria-hidden className="text-xl leading-none">{title.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title.name}</p>
        {title.description !== "" && <p className="text-sm text-ink-soft">{title.description}</p>}
        <div className="mt-1 flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil className="size-4" />} onClick={onEdit}>Editar</Button>
          {!isCrown && (
            <Button
              variant={confirmingDelete ? "danger" : "ghost"}
              size="sm"
              icon={<Trash2 className="size-4" />}
              onClick={onDelete}
            >
              {confirmingDelete ? "Tirar mesmo" : "Tirar da lista"}
            </Button>
          )}
        </div>
      </div>
      {!isCrown && (
        <div className="flex shrink-0 flex-col">
          <IconButton label={`Subir ${title.name}`} icon={<ArrowUp className="size-4" />} disabled={!canMoveUp} onClick={() => onMove(-1)} className="size-8" />
          <IconButton label={`Descer ${title.name}`} icon={<ArrowDown className="size-4" />} disabled={!canMoveDown} onClick={() => onMove(1)} className="size-8" />
        </div>
      )}
    </li>
  );
}
