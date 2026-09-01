import { ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { sortDoneTasks, sortOpenTasks } from "../domain/taskSort";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useMemberLookup } from "../hooks/useMembers";
import { useNow } from "../hooks/useNow";
import { useTaskMutations, useTasks } from "../hooks/useTasks";
import { MemberFilter } from "../components/members/MemberFilter";
import { DoneTaskRow } from "../components/tasks/DoneTaskRow";
import { TaskDialogs } from "../components/tasks/TaskDialogs";
import { TaskList } from "../components/tasks/TaskList";
import { useTaskDialogs } from "../components/tasks/useTaskDialogs";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Segmented } from "../components/ui/Segmented";

type Status = "open" | "done";

export function TasksPage() {
  const now = useNow();
  const { tasks } = useTasks();
  const { update } = useTaskMutations();
  const { memberId, member: filtered } = useMemberFilter();
  const lookup = useMemberLookup();
  const dialogs = useTaskDialogs();
  const [status, setStatus] = useState<Status>("open");

  const visible = tasks.filter((task) => memberId === null || task.assigneeId === memberId);
  const open = sortOpenTasks(visible.filter((task) => task.status === "open"), now);
  const done = sortDoneTasks(visible.filter((task) => task.status === "done"));

  const options = [
    { value: "open" as const, label: `Abertas · ${open.length}` },
    { value: "done" as const, label: `Feitas · ${done.length}` },
  ];

  return (
    <div className="space-y-5 animate-rise">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        <Button icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>
      </div>
      <MemberFilter />
      <Segmented label="Situação" options={options} value={status} onChange={setStatus} />

      {status === "done" ? (
        done.length === 0 ? (
          <EmptyState icon={<ListChecks className="size-6" />} title="Nada concluído ainda" hint="Tarefas pontuais aparecem aqui quando terminam. As recorrentes só mudam de data." />
        ) : (
          <ul className="space-y-2">
            {done.map((task) => (
              <DoneTaskRow key={task.id} task={task} onReopen={(reopened) => update.mutate({ id: reopened.id, input: { status: "open" } })} />
            ))}
          </ul>
        )
      ) : open.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title={filtered ? `Nada atribuído a ${filtered.name}` : "Nenhuma tarefa aberta"}
          hint={filtered ? "Crie uma tarefa para essa pessoa ou veja todas." : "Crie a primeira: o que precisa ser feito na casa?"}
          action={<Button size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
        />
      ) : (
        <TaskList tasks={open} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} />
      )}

      <TaskDialogs dialogs={dialogs} />
    </div>
  );
}
