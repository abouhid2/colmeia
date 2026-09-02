import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { crownTitle, reorderTitles, votedTitles } from "../../domain/seasonTitles";
import type { SeasonTitle } from "../../domain/types";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useSeasonTitles, useSeasonTitleMutations } from "../../hooks/useSeasonTitles";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { SeasonTitleForm } from "./SeasonTitleForm";
import { SeasonTitleRow } from "./SeasonTitleRow";

export function SeasonTitlesDialog({ open, onClose }: { open: boolean; onClose(): void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Títulos da colmeia"
      description="Valem para todas as estações."
    >
      <TitleManager />
    </Dialog>
  );
}

function TitleManager() {
  const { titles } = useSeasonTitles();
  const { update, remove } = useSeasonTitleMutations();
  const { notify } = useToast();
  const adding = useDisclosure();
  const [ editingId, setEditingId ] = useState<number | null>(null);
  const [ confirmingDeleteId, setConfirmingDeleteId ] = useState<number | null>(null);

  // The crown always leads, and the voted ones follow in the order the family put them.
  const ordered = useMemo(() => {
    const crown = crownTitle(titles);
    return [ ...(crown === null ? [] : [ crown ]), ...votedTitles(titles) ];
  }, [ titles ]);

  const move = (title: SeasonTitle, step: -1 | 1) => {
    reorderTitles(ordered, title.id, step).forEach((entry) => update.mutate({ id: entry.id, input: { position: entry.position } }));
  };

  const askDelete = (title: SeasonTitle) => {
    if (confirmingDeleteId !== title.id) { setConfirmingDeleteId(title.id); return; }
    remove.mutate(title.id, {
      onSuccess: () => { notify({ message: `${title.name} saiu da lista` }); setConfirmingDeleteId(null); },
    });
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {ordered.map((title, index) => (
          editingId === title.id ? (
            <li key={title.id}><SeasonTitleForm title={title} onDone={() => setEditingId(null)} /></li>
          ) : (
            <SeasonTitleRow
              key={title.id}
              title={title}
              isCrown={title.kind === "auto"}
              canMoveUp={index > 1}
              canMoveDown={index > 0 && index < ordered.length - 1}
              confirmingDelete={confirmingDeleteId === title.id}
              onEdit={() => { adding.close(); setEditingId(title.id); }}
              onMove={(step) => move(title, step)}
              onDelete={() => askDelete(title)}
            />
          )
        ))}
      </ul>

      {adding.isOpen ? (
        <SeasonTitleForm title={null} onDone={adding.close} />
      ) : (
        <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => { setEditingId(null); adding.open(); }}>
          Novo título
        </Button>
      )}
    </div>
  );
}
