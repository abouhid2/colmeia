import type { Task, TaskInput } from "../../domain/types";
import { useSession } from "../../hooks/useSession";
import { useTaskMutations } from "../../hooks/useTasks";
import { useToast } from "../../hooks/useToast";
import { Dialog } from "../ui/Dialog";
import { LogDoneForm } from "./LogDoneForm";
import { TaskForm } from "./TaskForm";

/** "plan" is a task still to do; "logged" is one that already happened. */
export type TaskDialogMode = "plan" | "logged";

interface TaskDialogProps {
  open: boolean;
  mode: TaskDialogMode;
  task: Task | null;
  onClose(): void;
}

export function TaskDialog({ open, mode, task, onClose }: TaskDialogProps) {
  const logged = mode === "logged";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={logged ? "Registrar algo já feito" : task ? "Editar tarefa" : "Nova tarefa"}
      description={logged ? "Vale os mesmos pontos, mesmo que ninguém tenha criado a tarefa antes." : undefined}
    >
      {logged ? <LogDoneForm onDone={onClose} /> : <PlanTaskForm key={task?.id ?? "new"} task={task} onDone={onClose} />}
    </Dialog>
  );
}

function PlanTaskForm({ task, onDone }: { task: Task | null; onDone(): void }) {
  const { members, currentMember } = useSession();
  const { create, update, remove } = useTaskMutations();
  const { notify } = useToast();

  const submit = (input: TaskInput) => {
    if (task) {
      update.mutate({ id: task.id, input }, { onSuccess: () => { notify({ tone: "success", message: "Tarefa salva" }); onDone(); } });
    } else {
      create.mutate(input, { onSuccess: () => { notify({ tone: "success", message: "Tarefa criada" }); onDone(); } });
    }
  };

  const destroy = () => {
    if (!task) return;
    remove.mutate(task.id, { onSuccess: () => { notify({ message: "Tarefa excluída" }); onDone(); } });
  };

  return (
    <TaskForm
      task={task}
      members={members}
      currentMemberId={currentMember?.id ?? null}
      submitting={create.isPending || update.isPending}
      onSubmit={submit}
      onDelete={task ? destroy : undefined}
      onCancel={onDone}
    />
  );
}
