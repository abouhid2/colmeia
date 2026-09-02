import { ArrowRight, Plus, Sun, Target } from "lucide-react";
import { Link, useLocation } from "react-router";
import { isClosed } from "../domain/seasons";
import { sortOpenTasks } from "../domain/taskSort";
import { useCompletions } from "../hooks/useCompletions";
import { useCrown } from "../hooks/useCrown";
import { useGoalOverview } from "../hooks/useGoalOverview";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useMemberLookup } from "../hooks/useMembers";
import { useNow } from "../hooks/useNow";
import { useSeason } from "../hooks/useSeasonContext";
import { useSession } from "../hooks/useSession";
import { useTasks } from "../hooks/useTasks";
import { GoalCard } from "../components/goal/GoalCard";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalEmptyCard } from "../components/goal/GoalEmptyCard";
import { GoalSummaryCard } from "../components/goal/GoalSummaryCard";
import { IN_SEASON_HINT } from "../components/goal/goalCopy";
import { useGoalDialog } from "../components/goal/useGoalDialog";
import { ActivityFeed } from "../components/home/ActivityFeed";
import { Greeting } from "../components/home/Greeting";
import { LagartinhaLeague } from "../components/members/LagartinhaLeague";
import { Leaderboard } from "../components/members/Leaderboard";
import { MemberFilter } from "../components/members/MemberFilter";
import { NoSeasonState } from "../components/season/NoSeasonState";
import { SeasonClosedNotice } from "../components/season/SeasonClosedNotice";
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
  const { currentSeason, isLoading: loadingSeasons } = useSeason();
  const { memberId, member: filtered } = useMemberFilter();
  const { household, personal, standings } = useGoalOverview();
  const { tasks } = useTasks();
  const { completions } = useCompletions();
  const lookup = useMemberLookup();
  const crown = useCrown();
  const dialogs = useTaskDialogs();
  const goalDialog = useGoalDialog();

  if (currentSeason === null) return loadingSeasons ? null : <NoSeasonState />;

  const closed = isClosed(currentSeason);
  const personalShown = memberId === null ? personal : personal.filter((item) => item.goal.memberId === memberId);
  const openTasks = tasks.filter((task) => task.status === "open" && (memberId === null || task.assigneeId === memberId));
  const spotlight = sortOpenTasks(openTasks, now).slice(0, SPOTLIGHT_SIZE);
  const recent = completions
    .filter((completion) => completion.status === "approved" && completion.seasonId === currentSeason.id && (memberId === null || completion.memberId === memberId))
    .slice(0, FEED_SIZE);

  return (
    <div className="space-y-8 animate-rise">
      <Greeting member={currentMember} now={now} crowned={crown !== null && crown.member.id === currentMember?.id} />
      {closed && <SeasonClosedNotice name={currentSeason.name} />}
      <MemberFilter />

      {household.length === 0 ? (
        !closed && <GoalEmptyCard onCreate={() => goalDialog.openCreate(null)} />
      ) : (
        household.map((item) => (
          <GoalCard key={item.goal.id} item={item} readOnly={closed} onEdit={() => goalDialog.openEdit(item.goal)} />
        ))
      )}

      <section>
        <SectionHeading
          title="Metas individuais"
          hint={filtered ? `Só as de ${filtered.name}.` : "Cada um com a sua meta e a sua recompensa."}
          action={closed ? undefined : <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(memberId ?? currentMember?.id ?? null)}>Nova meta</Button>}
        />
        {personalShown.length === 0 ? (
          <EmptyState icon={<Target className="size-6" />} title={filtered ? `${filtered.name} ainda não tem meta` : "Ninguém tem meta individual ainda"} hint="Uma recompensa para uma pessoa só, contando os pontos dela." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {personalShown.map((item) => (
              <GoalSummaryCard key={item.goal.id} item={item} readOnly={closed} onEdit={() => goalDialog.openEdit(item.goal)} />
            ))}
          </ul>
        )}
      </section>

      <PendingReviews />

      <section>
        <SectionHeading
          title="Para fazer agora"
          hint={filtered ? `Na fila de ${filtered.name}, as mais urgentes primeiro.` : "As mais urgentes primeiro."}
          action={closed ? undefined : <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
        />
        {spotlight.length === 0 ? (
          <EmptyState icon={<Sun className="size-6" />} title={filtered ? `${filtered.name} está sem tarefa` : "Nenhuma tarefa aberta"} hint={filtered ? "Passe uma tarefa para essa pessoa ou tire o filtro." : "A casa está em dia. Aproveite."} />
        ) : (
          <>
            <TaskList tasks={spotlight} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} readOnly={closed} />
            <Link to={{ pathname: "/tarefas", search }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
              Ver todas as tarefas <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </section>

      <section>
        <SectionHeading title="Quem mais contribuiu" hint={IN_SEASON_HINT} />
        <Leaderboard standings={standings} crownedMemberId={crown?.member.id ?? null} />
      </section>

      <LagartinhaLeague standings={standings} />

      <ActivityFeed completions={recent} now={now} lookup={lookup} />

      <TaskDialogs dialogs={dialogs} />
      <GoalDialog dialog={goalDialog} />
    </div>
  );
}
