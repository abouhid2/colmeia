import { ListChecks, Plus, UserRound } from "lucide-react";
import { useState } from "react";
import { sortDoneTasks, sortOpenTasks } from "../domain/taskSort";
import { useMemberLookup } from "../hooks/useMembers";
import { useNow } from "../hooks/useNow";
import { useSession } from "../hooks/useSession";
import { useTaskMutations, useTasks } from "../hooks/useTasks";
import { DoneTaskRow } from "../components/tasks/DoneTaskRow";
import { TaskDialogs } from "../components/tasks/TaskDialogs";
import { TaskList } from "../components/tasks/TaskList";
import { useTaskDialogs } from "../components/tasks/useTaskDialogs";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Segmented } from "../components/ui/Segmented";

type Filter = "open" | "mine" | "done";

export function TasksPage() {
  const now = useNow();
  const { tasks } = useTasks();
  const { update } = useTaskMutations();
  const { currentMember } = useSession();
  const lookup = useMemberLookup();
  const dialogs = useTaskDialogs();
  const [filter, setFilter] = useState<Filter>("open");

  const open = sortOpenTasks(tasks.filter((task) => task.status === "open"), now);
  const mine = open.filter((task) => task.assigneeId === currentMember?.id);
  const done = sortDoneTasks(tasks.filter((task) => task.status === "done"));
  const visible = filter === "open" ? open : mine;

  const options = [
    { value: "open" as const, label: `Abertas · ${open.length}` },
    { value: "mine" as const, label: `Minhas · ${mine.length}` },
    { value: "done" as const, label: `Feitas · ${done.length}` },
  ];

  return (
    <div className="space-y-5 animate-rise">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        <Button icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>
      </div>
      <Segmented label="Filtro" options={options} value={filter} onChange={setFilter} />

      {filter === "done" ? (
        done.length === 0 ? (
          <EmptyState icon={<ListChecks className="size-6" />} title="Nada concluído ainda" hint="Tarefas pontuais aparecem aqui quando terminam. As recorrentes só mudam de data." />
        ) : (
          <ul className="space-y-2">
            {done.map((task) => (
              <DoneTaskRow key={task.id} task={task} onReopen={(reopened) => update.mutate({ id: reopened.id, input: { status: "open" } })} />
            ))}
          </ul>
        )
      ) : visible.length === 0 ? (
        filter === "mine" ? (
          <EmptyState icon={<UserRound className="size-6" />} title="Nada atribuído a você" hint="Pegue uma tarefa aberta ou peça para alguém atribuir." action={<Button variant="secondary" size="sm" onClick={() => setFilter("open")}>Ver abertas</Button>} />
        ) : (
          <EmptyState icon={<ListChecks className="size-6" />} title="Nenhuma tarefa aberta" hint="Crie a primeira: o que precisa ser feito na casa?" action={<Button size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>} />
        )
      ) : (
        <TaskList tasks={visible} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} />
      )}

      <TaskDialogs dialogs={dialogs} />
    </div>
  );
}
