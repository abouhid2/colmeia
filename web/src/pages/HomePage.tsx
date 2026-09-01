import { ArrowRight, Plus, Sun, Target } from "lucide-react";
import { Link, useLocation } from "react-router";
import { sortOpenTasks } from "../domain/taskSort";
import { useCompletions } from "../hooks/useCompletions";
import { useGoalOverview } from "../hooks/useGoalOverview";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useMemberLookup } from "../hooks/useMembers";
import { useNow } from "../hooks/useNow";
import { useSession } from "../hooks/useSession";
import { useTasks } from "../hooks/useTasks";
import { GoalCard } from "../components/goal/GoalCard";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalEmptyCard } from "../components/goal/GoalEmptyCard";
import { GoalSummaryCard } from "../components/goal/GoalSummaryCard";
import { useGoalDialog } from "../components/goal/useGoalDialog";
import { ActivityFeed } from "../components/home/ActivityFeed";
import { Greeting } from "../components/home/Greeting";
import { Leaderboard } from "../components/members/Leaderboard";
import { MemberFilter } from "../components/members/MemberFilter";
import { PendingReviews } from "../components/reviews/PendingReviews";
import { TaskDialogs } from "../components/tasks/TaskDialogs";
import { TaskList } from "../components/tasks/TaskList";
import { useTaskDialogs } from "../components/tasks/useTaskDialogs";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";

const SPOTLIGHT_SIZE = 4;
const FEED_SIZE = 5;

export function HomePage() {
  const now = useNow();
  const { search } = useLocation();
  const { currentMember } = useSession();
  const { memberId, member: filtered } = useMemberFilter();
  const { household, personal, period, standings } = useGoalOverview();
  const { tasks } = useTasks();
  const { completions } = useCompletions();
  const lookup = useMemberLookup();
  const dialogs = useTaskDialogs();
  const goalDialog = useGoalDialog();

  const personalShown = memberId === null ? personal : personal.filter((item) => item.goal.memberId === memberId);
  const openTasks = tasks.filter((task) => task.status === "open" && (memberId === null || task.assigneeId === memberId));
  const spotlight = sortOpenTasks(openTasks, now).slice(0, SPOTLIGHT_SIZE);
  const recent = completions
    .filter((completion) => completion.status === "approved" && (memberId === null || completion.memberId === memberId))
    .slice(0, FEED_SIZE);

  return (
    <div className="space-y-8 animate-rise">
      <Greeting member={currentMember} now={now} />
      <MemberFilter />

      {household.length === 0 ? (
        <GoalEmptyCard onCreate={() => goalDialog.openCreate(null)} />
      ) : (
        household.map((item) => (
          <GoalCard key={item.goal.id} goal={item.goal} progress={item.progress} standings={item.standings} onEdit={() => goalDialog.openEdit(item.goal)} />
        ))
      )}

      <section>
        <SectionHeading
          title="Metas individuais"
          hint={filtered ? `Só de ${filtered.name}.` : "Cada um com a sua recompensa."}
          action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(memberId ?? currentMember?.id ?? null)}>Nova meta</Button>}
        />
        {personalShown.length === 0 ? (
          <EmptyState icon={<Target className="size-6" />} title={filtered ? `${filtered.name} ainda não tem meta` : "Ninguém tem meta individual ainda"} hint="Uma recompensa só para uma pessoa, contando só os pontos dela." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {personalShown.map((item) => (
              <GoalSummaryCard key={item.goal.id} item={item} onEdit={() => goalDialog.openEdit(item.goal)} />
            ))}
          </ul>
        )}
      </section>

      <PendingReviews />

      <section>
        <SectionHeading
          title="Para fazer agora"
          hint={filtered ? `Atribuídas a ${filtered.name}, as mais urgentes primeiro.` : "As mais urgentes primeiro."}
          action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
        />
        {spotlight.length === 0 ? (
          <EmptyState icon={<Sun className="size-6" />} title={filtered ? `Nada atribuído a ${filtered.name}` : "Nenhuma tarefa aberta"} hint={filtered ? "Atribua uma tarefa ou limpe o filtro." : "A casa está em dia. Aproveite."} />
        ) : (
          <>
            <TaskList tasks={spotlight} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} />
            <Link to={{ pathname: "/tarefas", search }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
              Ver todas as tarefas <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </section>

      <section>
        <SectionHeading title="Quem mais contribuiu" hint={period === "month" ? "Neste mês" : "Nesta semana"} />
        <Leaderboard standings={standings} />
      </section>

      <ActivityFeed completions={recent} lookup={lookup} />

      <TaskDialogs dialogs={dialogs} />
      <GoalDialog dialog={goalDialog} />
    </div>
  );
}
