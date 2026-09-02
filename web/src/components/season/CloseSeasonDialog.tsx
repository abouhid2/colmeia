import type { Season } from "../../domain/types";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

interface CloseSeasonDialogProps {
  /** The estação about to be frozen, or null while nothing is. */
  season: Season | null;
  isPending: boolean;
  onCancel(): void;
  onConfirm(): void;
}

/** Closing freezes the ranking and opens the voting: worth asking twice. */
export function CloseSeasonDialog({ season, isPending, onCancel, onConfirm }: CloseSeasonDialogProps) {
  return (
    <Dialog
      open={season !== null}
      onClose={onCancel}
      title={season ? `Encerrar ${season.name}?` : "Encerrar estação"}
      description="Ninguém pontua mais nela, e as tarefas dela param de aceitar conclusão."
    >
      <p className="text-sm text-ink-soft">Os títulos saem do ranking que congelar agora, e a votação abre.</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onConfirm} loading={isPending}>Encerrar estação</Button>
      </div>
    </Dialog>
  );
}
