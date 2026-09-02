import { useState, type FormEvent } from "react";
import { LIMITS } from "../../domain/limits";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { useSeason } from "../../hooks/useSeasonContext";
import { useSeasonMutations } from "../../hooks/useSeasons";
import { useToast } from "../../hooks/useToast";
import { toIsoDate } from "../../lib/dates";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field } from "../ui/Field";
import { Input, Select } from "../ui/Input";
import { seasonRange } from "../goal/goalCopy";
import type { SeasonDialogState } from "./useSeasonDialog";

const NO_COPY = "";

export function SeasonDialog({ dialog }: { dialog: SeasonDialogState }) {
  const { isOpen, season, close } = dialog;
  return (
    <Dialog
      open={isOpen}
      onClose={close}
      title={season ? "Ajustar a estação" : "Nova estação"}
      description="Um campeonato com as suas tarefas, as suas metas e o seu ranking."
    >
      <SeasonForm key={season?.id ?? "new"} season={season} onDone={close} />
    </Dialog>
  );
}

function SeasonForm({ season, onDone }: { season: Season | null; onDone(): void }) {
  const { seasons, currentSeason, setCurrentSeasonId } = useSeason();
  const { create, update } = useSeasonMutations();
  const { notify } = useToast();
  const [name, setName] = useState(season?.name ?? "");
  const [startsOn, setStartsOn] = useState(season?.startsOn ?? toIsoDate(new Date()));
  const [endsOn, setEndsOn] = useState(season?.endsOn ?? "");
  const [copyFrom, setCopyFrom] = useState(season ? NO_COPY : String(currentSeason?.id ?? NO_COPY));

  const reusable = seasons.filter((candidate) => candidate.tasksCount > 0);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const dates = { name, startsOn, endsOn: endsOn === "" ? null : endsOn };
    if (season) {
      update.mutate({ id: season.id, input: dates }, { onSuccess: () => { notify({ tone: "success", message: "Estação salva" }); onDone(); } });
      return;
    }
    create.mutate(
      { ...dates, copyTasksFromSeasonId: copyFrom === NO_COPY ? null : Number(copyFrom) },
      {
        onSuccess: (created: Season) => {
          setCurrentSeasonId(created.id);
          notify({ tone: "success", message: `Estação ${created.name} aberta` });
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nome" htmlFor="season-name" hint="Ex.: Estação do verão, Setembro, Férias.">
        <Input id="season-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como a família chama esse campeonato" maxLength={LIMITS.seasonName} required autoFocus />
      </Field>
      <Field label="Começa em" htmlFor="season-starts">
        <Input id="season-starts" type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} required />
      </Field>
      <Field label="Termina em" htmlFor="season-ends" hint="Pode ficar em branco: a estação corre até vocês encerrarem.">
        <Input id="season-ends" type="date" min={startsOn} value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
      </Field>
      {season === null && reusable.length > 0 && (
        <Field label="Reaproveitar tarefas de" htmlFor="season-copy" hint="As tarefas abertas vêm junto, sem prazo e com o placar zerado.">
          <Select id="season-copy" value={copyFrom} onChange={(event) => setCopyFrom(event.target.value)}>
            <option value={NO_COPY}>Começar do zero</option>
            {reusable.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} · {candidate.tasksCount} {candidate.tasksCount === 1 ? "tarefa" : "tarefas"}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {season !== null && isClosed(season) && (
        <p className="text-sm text-ink-soft">Esta estação está encerrada. Reabra para voltar a pontuar nela.</p>
      )}
      {season !== null && <p className="text-sm text-ink-soft">{seasonRange(season)}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button type="submit" loading={create.isPending || update.isPending}>{season ? "Salvar" : "Abrir estação"}</Button>
      </div>
    </form>
  );
}
