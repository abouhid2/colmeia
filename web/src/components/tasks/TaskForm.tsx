import { Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { LIMITS } from "../../domain/limits";
import { PRIORITIES, PRIORITY_OPTIONS } from "../../domain/priorities";
import type { Member, Task, TaskInput } from "../../domain/types";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input, Textarea } from "../ui/Input";
import { Segmented } from "../ui/Segmented";
import { Toggle } from "../ui/Toggle";
import { PointsPicker } from "./PointsPicker";
import { TaskScheduleFields } from "./TaskScheduleFields";
import { toTaskInput, useTaskForm } from "./useTaskForm";

/** The "já feita" flow: nothing to schedule, and the caller owns who did it
 *  and when, since neither belongs to the task itself. */
export interface LoggedMode {
  fields: ReactNode;
  /** Whether who and when are both settled. */
  ready: boolean;
}

interface TaskFormProps {
  task: Task | null;
  members: Member[];
  currentMemberId: number | null;
  /** The estação the task belongs to; a task never leaves the one it was made in. */
  seasonId: number;
  submitting: boolean;
  logged?: LoggedMode;
  onSubmit(input: TaskInput): void;
  onDelete?(): void;
  onCancel(): void;
}

const PRIORITY_SEGMENTS = PRIORITY_OPTIONS.map((priority) => ({ value: priority, label: PRIORITIES[priority].label }));

export function TaskForm({ task, members, currentMemberId, seasonId, submitting, logged, onSubmit, onDelete, onCancel }: TaskFormProps) {
  const form = useTaskForm(task);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    form.touch();
    if (form.isValid) onSubmit(toTaskInput(form.values, task?.createdById ?? currentMemberId, seasonId));
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Tarefa" htmlFor="task-title" error={form.errors.title}>
        <Input id="task-title" value={form.values.title} onChange={(event) => form.set("title", event.target.value)} placeholder="Ex.: trocar a resistência do chuveiro" maxLength={LIMITS.taskTitle} autoFocus />
      </Field>
      <Field label="Vale quantos pontos" htmlFor="task-points" error={form.errors.points}>
        <PointsPicker value={form.values.points} onChange={(points) => form.set("points", points)} />
      </Field>
      <Field label="Prioridade">
        <Segmented label="Prioridade" options={PRIORITY_SEGMENTS} value={form.values.priority} onChange={(priority) => form.set("priority", priority)} />
      </Field>
      {logged
        ? logged.fields
        : <TaskScheduleFields values={form.values} errors={form.errors} members={members} set={form.set} />}
      <Toggle
        checked={form.values.requiresReview}
        onChange={(checked) => form.set("requiresReview", checked)}
        label="Precisa de avaliação"
        hint="Outra pessoa dá uma nota de 1 a 5, e os pontos saem conforme a nota."
      />
      <Toggle
        checked={form.values.kidFriendly}
        onChange={(checked) => form.set("kidFriendly", checked)}
        label="Boa para lagartinhas"
        hint="Uma criança dá conta desta tarefa sozinha."
      />
      <Field label="Detalhes" htmlFor="task-description">
        <Textarea id="task-description" value={form.values.description} onChange={(event) => form.set("description", event.target.value)} placeholder="Onde está o material, o que observar…" />
      </Field>
      <div className="flex items-center justify-between gap-2 pt-2">
        {onDelete ? (
          <Button variant={confirmingDelete ? "danger" : "ghost"} size="sm" icon={<Trash2 className="size-4" />} onClick={() => (confirmingDelete ? onDelete() : setConfirmingDelete(true))}>
            {confirmingDelete ? "Excluir mesmo" : "Excluir tarefa"}
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" loading={submitting} disabled={logged !== undefined && !logged.ready}>
            {logged ? "Registrar como feita" : task ? "Salvar tarefa" : "Criar tarefa"}
          </Button>
        </div>
      </div>
    </form>
  );
}
