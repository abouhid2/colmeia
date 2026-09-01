import { useState, type FormEvent } from "react";
import type { Goal, GoalPeriod } from "../../domain/types";
import { useSaveGoal } from "../../hooks/useGoal";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Segmented } from "../ui/Segmented";

interface GoalDialogProps {
  open: boolean;
  goal: Goal | null;
  onClose(): void;
}

const PERIOD_OPTIONS: { value: GoalPeriod; label: string }[] = [
  { value: "week", label: "Por semana" },
  { value: "month", label: "Por mês" },
];

export function GoalDialog({ open, goal, onClose }: GoalDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={goal ? "Ajustar a meta" : "Definir a meta"} description="Os pontos aprovados no período contam para a recompensa de todos.">
      <GoalForm key={goal?.id ?? "new"} goal={goal} onDone={onClose} />
    </Dialog>
  );
}

function GoalForm({ goal, onDone }: { goal: Goal | null; onDone(): void }) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [target, setTarget] = useState(goal?.targetPoints ?? 300);
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? "week");
  const save = useSaveGoal();
  const { notify } = useToast();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate({ title, targetPoints: target, period }, {
      onSuccess: () => { notify({ tone: "success", message: "Meta salva" }); onDone(); },
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Recompensa" htmlFor="goal-title" hint="Ex.: pizza e filme no sábado, passeio no parque.">
        <Input id="goal-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="O que a casa ganha" required autoFocus />
      </Field>
      <Field label="Pontos para bater a meta" htmlFor="goal-target">
        <Input id="goal-target" type="number" min={1} step={1} value={target} onChange={(event) => setTarget(Number(event.target.value))} required />
      </Field>
      <Field label="Período">
        <Segmented label="Período" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button type="submit" loading={save.isPending}>Salvar meta</Button>
      </div>
    </form>
  );
}
