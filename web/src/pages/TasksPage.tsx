import { CalendarCheck, ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { canReopen, completionsForMember } from "../domain/history";
import { completionsInSeason, isClosed } from "../domain/seasons";
import { sortOpenTasks } from "../domain/taskSort";
import { useCompletions } from "../hooks/useCompletions";
import { useLagartinhasEnabled } from "../hooks/useLagartinhas";
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
import { FilterChip } from "../components/ui/FilterChip";
import { Segmented } from "../components/ui/Segmented";

type Status = "open" | "done";

const HISTORY_PAGE = 50;

export function TasksPage() {
  const now = useNow();
  const { currentSeason, isLoading: loadingSeasons } = useSeason();
  const { tasks } = useTasks();
  const { completions } = useCompletions();
  const { reopen } = useTaskMutations();
  const { memberId, member: filtered } = useMemberFilter();
  const lagartinhasEnabled = useLagartinhasEnabled();
  const lookup = useMemberLookup();
  const dialogs = useTaskDialogs();
  const [status, setStatus] = useState<Status>("open");
  const [shown, setShown] = useState(HISTORY_PAGE);
  const [wantsKidOnly, setWantsKidOnly] = useState(false);

  if (currentSeason === null) return loadingSeasons ? null : <NoSeasonState />;

  const closed = isClosed(currentSeason);
  // Nothing to filter by until an adult has marked a task for the children,
  // and nothing at all in a colmeia that says it has none.
  const canFilterKid = lagartinhasEnabled && tasks.some((task) => task.kidFriendly);
  // A chip nobody can see must not keep filtering the list behind their back.
  const kidOnly = canFilterKid && wantsKidOnly;
  const open = sortOpenTasks(
    tasks.filter((task) =>
      task.status === "open"
      && (memberId === null || task.assigneeIds.includes(memberId))
      && (!kidOnly || task.kidFriendly)),
    now,
  );
  const done = completionsForMember(completionsInSeason(completions, currentSeason.id), memberId);
  const history = done.slice(0, shown);

  const options = [
    { value: "open" as const, label: `Abertas · ${open.length}` },
    { value: "done" as const, label: `Feitas · ${done.length}` },
  ];

  return (
    <div className="space-y-5 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        {!closed && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<CalendarCheck className="size-4" />} onClick={dialogs.openLogDone}>
              Registrar algo já feito
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>
          </div>
        )}
      </div>
      {closed && <SeasonClosedNotice name={currentSeason.name} />}
      <MemberFilter />
      <div className="flex flex-wrap items-center gap-2">
        <Segmented label="Situação" options={options} value={status} onChange={setStatus} />
        {status === "open" && canFilterKid && (
          <FilterChip selected={kidOnly} aria-pressed={kidOnly} onClick={() => setWantsKidOnly((current) => !current)}>
            <span aria-hidden>🐛</span> Para lagartinhas
          </FilterChip>
        )}
      </div>

      {status === "done" ? (
        done.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="size-6" />}
            title={filtered ? `${filtered.name} ainda não fez nada nesta estação` : "Nada concluído nesta estação"}
          />
        ) : (
          <>
            <ul className="space-y-2">
              {history.map((completion) => (
                <CompletionRow
                  key={completion.id}
                  completion={completion}
                  doer={lookup(completion.memberId)}
                  now={now}
                  canReopen={!closed && canReopen(completion, tasks.find((task) => task.id === completion.taskId) ?? null)}
                  onReopen={() => {
                    if (completion.taskId !== null) reopen.mutate(completion.taskId);
                  }}
                />
              ))}
            </ul>
            {done.length > history.length && (
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setShown((current) => current + HISTORY_PAGE)}>
                Ver mais
              </Button>
            )}
          </>
        )
      ) : open.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title={kidOnly ? "Nenhuma tarefa para lagartinhas" : filtered ? `${filtered.name} está sem tarefa` : "Nenhuma tarefa aberta"}
          hint={kidOnly ? "Marque \"boa para lagartinhas\" nas tarefas que uma criança dá conta." : filtered ? undefined : "Crie a primeira: o que precisa ser feito na casa?"}
          action={closed ? undefined : <Button size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
        />
      ) : (
        <TaskList tasks={open} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} readOnly={closed} />
      )}

      <TaskDialogs dialogs={dialogs} />
    </div>
  );
}
