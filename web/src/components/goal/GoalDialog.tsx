import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Goal, GoalPeriod } from "../../domain/types";
import { useGoalMutations } from "../../hooks/useGoals";
import { useSession } from "../../hooks/useSession";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field } from "../ui/Field";
import { Input, Select } from "../ui/Input";
import { Segmented } from "../ui/Segmented";
import type { GoalDialogState } from "./useGoalDialog";

const PERIOD_OPTIONS: { value: GoalPeriod; label: string }[] = [
  { value: "week", label: "Por semana" },
  { value: "month", label: "Por mês" },
];

export function GoalDialog({ dialog }: { dialog: GoalDialogState }) {
  const { isOpen, goal, defaultMemberId, close } = dialog;
  return (
    <Dialog open={isOpen} onClose={close} title={goal ? "Ajustar a meta" : "Nova meta"} description="Uma recompensa para a casa inteira ou só para uma pessoa.">
      <GoalForm key={`${goal?.id ?? "new"}-${defaultMemberId ?? "all"}`} goal={goal} defaultMemberId={defaultMemberId} onDone={close} />
    </Dialog>
  );
}

interface GoalFormProps {
  goal: Goal | null;
  defaultMemberId: number | null;
  onDone(): void;
}

function GoalForm({ goal, defaultMemberId, onDone }: GoalFormProps) {
  const { members } = useSession();
  const [title, setTitle] = useState(goal?.title ?? "");
  const [target, setTarget] = useState(goal?.targetPoints ?? 300);
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? "week");
  const [owner, setOwner] = useState(String(goal?.memberId ?? defaultMemberId ?? ""));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { create, update, remove } = useGoalMutations();
  const { notify } = useToast();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = { title, targetPoints: target, period, memberId: owner === "" ? null : Number(owner) };
    const onSuccess = () => { notify({ tone: "success", message: "Meta salva" }); onDone(); };
    if (goal) update.mutate({ id: goal.id, input }, { onSuccess });
    else create.mutate(input, { onSuccess });
  };

  const destroy = () => {
    if (!goal) return;
    remove.mutate(goal.id, { onSuccess: () => { notify({ message: "Meta removida" }); onDone(); } });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Para quem" htmlFor="goal-owner" hint={owner === "" ? "Os pontos de todo mundo contam." : "Só os pontos dessa pessoa contam."}>
        <Select id="goal-owner" value={owner} onChange={(event) => setOwner(event.target.value)}>
          <option value="">Toda a casa</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>{member.avatar} {member.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Recompensa" htmlFor="goal-title" hint="Ex.: pizza e filme no sábado, escolher o passeio.">
        <Input id="goal-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="O que se ganha" required autoFocus />
      </Field>
      <Field label="Pontos para bater a meta" htmlFor="goal-target">
        <Input id="goal-target" type="number" min={1} step={1} value={target} onChange={(event) => setTarget(Number(event.target.value))} required />
      </Field>
      <Field label="Período">
        <Segmented label="Período" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </Field>
      <div className="flex items-center justify-between gap-2 pt-2">
        {goal ? (
          <Button variant={confirmingDelete ? "danger" : "ghost"} size="sm" icon={<Trash2 className="size-4" />} onClick={() => (confirmingDelete ? destroy() : setConfirmingDelete(true))} loading={remove.isPending}>
            {confirmingDelete ? "Confirmar remoção" : "Remover"}
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
