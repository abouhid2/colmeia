import { Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { LIMITS } from "../../domain/limits";
import type { Goal, Season } from "../../domain/types";
import { useGoalMutations } from "../../hooks/useGoals";
import { useSeason } from "../../hooks/useSeasonContext";
import { useSession } from "../../hooks/useSession";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { GoalPeopleField } from "./GoalPeopleField";
import { GoalWindowField } from "./GoalWindowField";
import { goalPreviewSentence, participantsLabel } from "./goalCopy";
import { useGoalForm } from "./useGoalForm";
import type { GoalDialogState } from "./useGoalDialog";

export function GoalDialog({ dialog }: { dialog: GoalDialogState }) {
  const { isOpen, goal, defaultMemberIds, defaultSeasonId, close } = dialog;
  const { seasons, currentSeason } = useSeason();
  const season = seasons.find((candidate) => candidate.id === (goal?.seasonId ?? defaultSeasonId)) ?? currentSeason;
  if (season === null) return null;

  return (
    <Dialog open={isOpen} onClose={close} title={goal ? "Ajustar a meta" : "Nova meta"}>
      <GoalForm
        key={`${goal?.id ?? "new"}-${season.id}-${defaultMemberIds.join("-")}`}
        goal={goal}
        defaultMemberIds={defaultMemberIds}
        season={season}
        onDone={close}
      />
    </Dialog>
  );
}

interface GoalFormProps {
  goal: Goal | null;
  defaultMemberIds: number[];
  season: Season;
  onDone(): void;
}

function GoalForm({ goal, defaultMemberIds, season, onDone }: GoalFormProps) {
  const { members } = useSession();
  const form = useGoalForm(goal, defaultMemberIds, season);
  const [ confirmingDelete, setConfirmingDelete ] = useState(false);
  const { create, update, remove } = useGoalMutations();
  const { notify } = useToast();

  const { title, target, memberIds, ownWindow, startsOn, endsOn } = form.values;
  const picked = members.filter((member) => memberIds.includes(member.id));
  const preview = goalPreviewSentence({
    ownerName: picked.length === 0 ? null : participantsLabel(picked),
    targetPoints: target,
    seasonName: season.name,
    reward: title,
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = form.toInput(season.id);
    const onSuccess = () => { notify({ tone: "success", message: "Meta salva" }); onDone(); };
    if (goal) update.mutate({ id: goal.id, input }, { onSuccess });
    else create.mutate(input, { onSuccess });
  };

  const destroy = () => {
    if (!goal) return;
    remove.mutate(goal.id, { onSuccess: () => { notify({ message: "Meta apagada" }); onDone(); } });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <GoalPeopleField members={members} selected={memberIds} onToggle={form.toggleMember} onEveryone={form.clearMembers} />
      <GoalWindowField
        season={season} ownWindow={ownWindow} startsOn={startsOn} endsOn={endsOn}
        onOwnWindow={form.setOwnWindow} onStartsOn={form.setStartsOn} onEndsOn={form.setEndsOn}
      />
      <Field label="Meta em pontos" htmlFor="goal-target">
        <Input id="goal-target" type="number" min={1} max={LIMITS.goalTarget} step={1} value={target} onChange={(event) => form.setTarget(Number(event.target.value))} required />
      </Field>
      <Field label="Recompensa" htmlFor="goal-title">
        <Input id="goal-title" value={title} onChange={(event) => form.setTitle(event.target.value)} placeholder="Ex.: pizza e filme no sábado" maxLength={LIMITS.goalTitle} required />
      </Field>
      <div className="rounded-card border border-line bg-paper p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">Como fica</p>
        <p className="mt-1 text-sm">{preview}</p>
      </div>
      <div className="flex items-center justify-between gap-2 pt-2">
        {goal ? (
          <Button variant={confirmingDelete ? "danger" : "ghost"} size="sm" icon={<Trash2 className="size-4" />} onClick={() => (confirmingDelete ? destroy() : setConfirmingDelete(true))} loading={remove.isPending}>
            {confirmingDelete ? "Apagar mesmo" : "Apagar meta"}
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDone}>Cancelar</Button>
          <Button type="submit" loading={create.isPending || update.isPending}>Salvar meta</Button>
        </div>
      </div>
    </form>
  );
}
