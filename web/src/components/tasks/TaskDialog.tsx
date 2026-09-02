import type { Task, TaskInput } from "../../domain/types";
import { useSeason } from "../../hooks/useSeasonContext";
import { useSession } from "../../hooks/useSession";
import { useTaskMutations } from "../../hooks/useTasks";
import { useToast } from "../../hooks/useToast";
import { Dialog } from "../ui/Dialog";
import { TaskForm } from "./TaskForm";

interface TaskDialogProps {
  open: boolean;
  task: Task | null;
  onClose(): void;
}

export function TaskDialog({ open, task, onClose }: TaskDialogProps) {
  const { members, currentMember } = useSession();
  const { currentSeason } = useSeason();
  const { create, update, remove } = useTaskMutations();
  const { notify } = useToast();

  const submit = (input: TaskInput) => {
    if (task) {
      update.mutate({ id: task.id, input }, { onSuccess: () => { notify({ tone: "success", message: "Tarefa salva" }); onClose(); } });
    } else {
      create.mutate(input, { onSuccess: () => { notify({ tone: "success", message: "Tarefa criada" }); onClose(); } });
    }
  };

  const destroy = () => {
    if (!task) return;
    remove.mutate(task.id, { onSuccess: () => { notify({ message: "Tarefa excluída" }); onClose(); } });
  };

  const seasonId = task?.seasonId ?? currentSeason?.id ?? null;
  if (seasonId === null) return null;

  return (
    <Dialog open={open} onClose={onClose} title={task ? "Editar tarefa" : "Nova tarefa"}>
      <TaskForm
        key={task?.id ?? "new"}
        task={task}
        members={members}
        currentMemberId={currentMember?.id ?? null}
        seasonId={seasonId}
        submitting={create.isPending || update.isPending}
        onSubmit={submit}
        onDelete={task ? destroy : undefined}
        onCancel={onClose}
      />
    </Dialog>
  );
}
