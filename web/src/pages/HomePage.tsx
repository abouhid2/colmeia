import { ArrowRight, Plus, Sun } from "lucide-react";
import { Link } from "react-router";
import { sortOpenTasks } from "../domain/taskSort";
import { useCompletions } from "../hooks/useCompletions";
import { useDisclosure } from "../hooks/useDisclosure";
import { useGoalOverview } from "../hooks/useGoalOverview";
import { useMemberLookup } from "../hooks/useMembers";
import { useNow } from "../hooks/useNow";
import { useSession } from "../hooks/useSession";
import { useTasks } from "../hooks/useTasks";
import { GoalCard } from "../components/goal/GoalCard";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalEmptyCard } from "../components/goal/GoalEmptyCard";
import { ActivityFeed } from "../components/home/ActivityFeed";
import { Greeting } from "../components/home/Greeting";
import { Leaderboard } from "../components/members/Leaderboard";
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
  const { currentMember } = useSession();
  const { goal, progress, standings } = useGoalOverview();
  const { tasks } = useTasks();
  const { completions } = useCompletions();
  const lookup = useMemberLookup();
  const dialogs = useTaskDialogs();
  const goalDialog = useDisclosure();

  const spotlight = sortOpenTasks(tasks.filter((task) => task.status === "open"), now).slice(0, SPOTLIGHT_SIZE);
  const recent = completions.filter((completion) => completion.status === "approved").slice(0, FEED_SIZE);

  return (
    <div className="space-y-8 animate-rise">
      <Greeting member={currentMember} now={now} />

      {goal && progress ? (
        <GoalCard goal={goal} progress={progress} standings={standings} onEdit={goalDialog.open} />
      ) : (
        <GoalEmptyCard onCreate={goalDialog.open} />
      )}

      <PendingReviews />

      <section>
        <SectionHeading
          title="Para fazer agora"
          hint="As mais urgentes primeiro."
          action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={dialogs.openCreate}>Nova tarefa</Button>}
        />
        {spotlight.length === 0 ? (
          <EmptyState icon={<Sun className="size-6" />} title="Nenhuma tarefa aberta" hint="A casa está em dia. Aproveite." />
        ) : (
          <>
            <TaskList tasks={spotlight} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} />
            <Link to="/tarefas" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
              Ver todas as tarefas <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </section>

      <section>
        <SectionHeading title="Quem mais contribuiu" hint={goal?.period === "month" ? "Neste mês" : "Nesta semana"} />
        <Leaderboard standings={standings} />
      </section>

      <ActivityFeed completions={recent} lookup={lookup} />

      <TaskDialogs dialogs={dialogs} />
      <GoalDialog open={goalDialog.isOpen} goal={goal} onClose={goalDialog.close} />
    </div>
  );
}
