import { ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { canReopen, completionsForMember } from "../domain/history";
import { completionsInSeason } from "../domain/seasons";
import { isClosed } from "../domain/seasons";
import { sortOpenTasks } from "../domain/taskSort";
import { useCompletions } from "../hooks/useCompletions";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useMemberLookup } from "../hooks/useMembers";
import { useNow } from "../hooks/useNow";
import { useSeason } from "../hooks/useSeasonContext";
import { useTaskMutations, useTasks } from "../hooks/useTasks";
import { MemberFilter } from "../components/members/MemberFilter";
import { NoSeasonState } from "../components/season/NoSeasonState";
import { SeasonClosedNotice } from "../components/season/SeasonClosedNotice";
import { CompletionRow } from "../components/tasks/CompletionRow";
import { TaskDialogs } from "../components/tasks/TaskDialogs";
import { TaskList } from "../components/tasks/TaskList";
import { useTaskDialogs } from "../components/tasks/useTaskDialogs";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Segmented } from "../components/ui/Segmented";

type Status = "open" | "done";

export function TasksPage() {
  const now = useNow();
  const { currentSeason, isLoading: loadingSeasons } = useSeason();
  const { tasks } = useTasks();
  const { completions } = useCompletions();
  const { reopen } = useTaskMutations();
  const { memberId, member: filtered } = useMemberFilter();
  const lookup = useMemberLookup();
  const dialogs = useTaskDialogs();
  const [status, setStatus] = useState<Status>("open");

  if (currentSeason === null) return loadingSeasons ? null : <NoSeasonState />;

  const closed = isClosed(currentSeason);
  const open = sortOpenTasks(
    tasks.filter((task) => task.status === "open" && (memberId === null || task.assigneeId === memberId)),
    now,
  );
  const done = completionsForMember(completionsInSeason(completions, currentSeason.id), memberId);

  const options = [
    { value: "open" as const, label: `Abertas · ${open.length}` },
    { value: "done" as const, label: `Feitas · ${done.length}` },
  ];

  return (
    <div className="space-y-5 animate-rise">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        {!closed && <Button icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
      </div>
      {closed && <SeasonClosedNotice name={currentSeason.name} />}
      <MemberFilter />
      <Segmented label="Situação" options={options} value={status} onChange={setStatus} />

      {status === "done" ? (
        done.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="size-6" />}
            title={filtered ? `${filtered.name} ainda não concluiu nada` : "Nada concluído nesta estação"}
            hint={filtered ? undefined : "Toda tarefa concluída aparece aqui, inclusive as recorrentes."}
          />
        ) : (
          <ul className="space-y-2">
            {done.map((completion) => (
              <CompletionRow
                key={completion.id}
                completion={completion}
                doer={lookup(completion.memberId)}
                canReopen={!closed && canReopen(completion, tasks.find((task) => task.id === completion.taskId) ?? null)}
                onReopen={() => {
                  if (completion.taskId !== null) reopen.mutate(completion.taskId);
                }}
              />
            ))}
          </ul>
        )
      ) : open.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title={filtered ? `Nada atribuído a ${filtered.name}` : "Nenhuma tarefa aberta"}
          hint={filtered ? "Crie uma tarefa para essa pessoa ou veja todas." : "Crie a primeira: o que precisa ser feito na casa?"}
          action={closed ? undefined : <Button size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
        />
      ) : (
        <TaskList tasks={open} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} readOnly={closed} />
      )}

      <TaskDialogs dialogs={dialogs} />
    </div>
  );
}
