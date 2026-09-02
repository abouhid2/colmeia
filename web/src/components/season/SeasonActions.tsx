import { LockOpen, Pencil, Square, Trash2 } from "lucide-react";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { Button } from "../ui/Button";

interface SeasonActionsProps {
  season: Season;
  confirmingDelete: boolean;
  onEdit(): void;
  onClose(): void;
  onReopen(): void;
  onDelete(): void;
}

/** What can be done to an estação: adjust it, freeze it or reopen it, and
 *  throw it away while nothing was ever scored in it. */
export function SeasonActions({ season, confirmingDelete, onEdit, onClose, onReopen, onDelete }: SeasonActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" size="sm" icon={<Pencil className="size-4" />} onClick={onEdit}>Ajustar</Button>
      {isClosed(season) ? (
        <Button variant="ghost" size="sm" icon={<LockOpen className="size-4" />} onClick={onReopen}>Reabrir</Button>
      ) : (
        <Button variant="ghost" size="sm" icon={<Square className="size-4" />} onClick={onClose}>Encerrar</Button>
      )}
      {season.completionsCount === 0 && (
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
  );
}
