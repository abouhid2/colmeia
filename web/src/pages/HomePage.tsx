import { ArrowRight, Plus, Sun, Target } from "lucide-react";
import { Link, useLocation } from "react-router";
import { finishedGoal, goalsOf, runningGoal, upcomingGoal } from "../domain/goalBoard";
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
import { GoalUpcomingCard } from "../components/goal/GoalUpcomingCard";
import { SeasonRoadmap } from "../components/goal/SeasonRoadmap";
import { hasOwnWindow, IN_SEASON_HINT } from "../components/goal/goalCopy";
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
  const { all, household, withPeople, standings } = useGoalOverview();
  const { tasks } = useTasks();
  const { completions } = useCompletions();
  const lookup = useMemberLookup();
  const crown = useCrown();
  const dialogs = useTaskDialogs();
  const goalDialog = useGoalDialog();

  if (currentSeason === null) return loadingSeasons ? null : <NoSeasonState />;

  const closed = isClosed(currentSeason);
  // The meta da colmeia on today's stretch leads the page. Nothing running means
  // the next one gets a line of its own, and a finished estação shows its last.
  const running = runningGoal(household, now);
  const upcoming = upcomingGoal(household, now);
  const hero = running ?? (upcoming === null ? finishedGoal(household, now) : null);
  const showRoadmap = all.length > 1 || all.some((item) => hasOwnWindow(item.goal));
  const peopleGoals = goalsOf(withPeople, memberId);
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

      {household.length === 0 && !closed && <GoalEmptyCard onCreate={() => goalDialog.openCreate(null)} />}
      {hero && <GoalCard item={hero} readOnly={closed} onEdit={() => goalDialog.openEdit(hero.goal)} />}
      {hero === null && upcoming && (
        <GoalUpcomingCard item={upcoming} now={now} readOnly={closed} onEdit={() => goalDialog.openEdit(upcoming.goal)} />
      )}

      {showRoadmap && (
        <section>
          <SectionHeading
            title="Roteiro da estação"
            action={closed ? undefined : <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(null, currentSeason.id)}>Nova meta</Button>}
          />
          <SeasonRoadmap goals={all} now={now} onSelect={closed ? undefined : goalDialog.openEdit} />
        </section>
      )}

      <section>
        <SectionHeading
          title="Metas de pessoas e grupos"
          action={closed ? undefined : <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(memberId ?? currentMember?.id ?? null)}>Nova meta</Button>}
        />
        {peopleGoals.length === 0 ? (
          <EmptyState icon={<Target className="size-6" />} title={filtered ? `${filtered.name} não está em nenhuma meta` : "Ninguém está em uma meta ainda"} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {peopleGoals.map((item) => (
              <GoalSummaryCard key={item.goal.id} item={item} readOnly={closed} onEdit={() => goalDialog.openEdit(item.goal)} />
            ))}
          </ul>
        )}
        <Link to={{ pathname: "/metas", search }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
          Ver todas as metas <ArrowRight className="size-4" />
        </Link>
      </section>

      <PendingReviews />

      <section>
        <SectionHeading
          title="Para fazer agora"
          action={closed ? undefined : <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
        />
        {spotlight.length === 0 ? (
          <EmptyState icon={<Sun className="size-6" />} title={filtered ? `${filtered.name} está sem tarefa` : "Nenhuma tarefa aberta"} hint={filtered ? undefined : "A casa está em dia. Aproveite."} />
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
