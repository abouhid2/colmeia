import { Plus } from "lucide-react";
import { useState } from "react";
import { approvedCompletions } from "../domain/progress";
import { completionsInSeason } from "../domain/seasons";
import type { Season } from "../domain/types";
import { useCompletions } from "../hooks/useCompletions";
import { useSeason } from "../hooks/useSeasonContext";
import { useSeasonMutations } from "../hooks/useSeasons";
import { useToast } from "../hooks/useToast";
import { CloseSeasonDialog } from "../components/season/CloseSeasonDialog";
import { SeasonCard } from "../components/season/SeasonCard";
import { SeasonDialog } from "../components/season/SeasonDialog";
import { useSeasonDialog } from "../components/season/useSeasonDialog";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";

export function SeasonsPage() {
  const { seasons, currentSeason } = useSeason();
  const { completions } = useCompletions();
  const { close, reopen, remove } = useSeasonMutations();
  const { notify } = useToast();
  const dialog = useSeasonDialog();
  const [closing, setClosing] = useState<Season | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);

  const pointsIn = (season: Season) =>
    approvedCompletions(completionsInSeason(completions, season.id)).reduce((sum, completion) => sum + completion.pointsAwarded, 0);

  const confirmClose = () => {
    if (closing === null) return;
    close.mutate(closing.id, {
      onSuccess: () => { notify({ tone: "success", message: `${closing.name} encerrada` }); setClosing(null); },
    });
  };

  const askDelete = (season: Season) => {
    if (confirmingDeleteId !== season.id) { setConfirmingDeleteId(season.id); return; }
    remove.mutate(season.id, {
      onSuccess: () => { notify({ message: `${season.name} apagada` }); setConfirmingDeleteId(null); },
    });
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estações</h1>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={dialog.openCreate}>Nova estação</Button>
      </div>

      {seasons.length === 0 ? (
        <EmptyState
          icon={<Plus className="size-6" />}
          title="Nenhuma estação ainda"
          hint="Abra a primeira e comece a pontuar."
          action={<Button size="sm" icon={<Plus className="size-4" />} onClick={dialog.openCreate}>Nova estação</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {seasons.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              points={pointsIn(season)}
              isCurrent={season.id === currentSeason?.id}
              confirmingDelete={confirmingDeleteId === season.id}
              onEdit={() => dialog.openEdit(season)}
              onClose={() => setClosing(season)}
              onReopen={() => reopen.mutate(season.id, { onSuccess: () => notify({ message: `${season.name} reaberta` }) })}
              onDelete={() => askDelete(season)}
            />
          ))}
        </ul>
      )}

      <SeasonDialog dialog={dialog} />

      <CloseSeasonDialog
        season={closing}
        isPending={close.isPending}
        onCancel={() => setClosing(null)}
        onConfirm={confirmClose}
      />
    </div>
  );
}
