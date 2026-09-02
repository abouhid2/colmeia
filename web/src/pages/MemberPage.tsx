import { ArrowLeft, ListChecks, Pencil, Plus, Sparkles, Target, UserX } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";
import { useCrown } from "../hooks/useCrown";
import { useDisclosure } from "../hooks/useDisclosure";
import { useMemberLookup } from "../hooks/useMembers";
import { useMemberProfile } from "../hooks/useMemberProfile";
import { useNow } from "../hooks/useNow";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalSummaryCard } from "../components/goal/GoalSummaryCard";
import { useGoalDialog } from "../components/goal/useGoalDialog";
import { AchievementList } from "../components/members/AchievementList";
import { MemberDialog } from "../components/members/MemberDialog";
import { MemberHero } from "../components/members/MemberHero";
import { MemberHistory } from "../components/members/MemberHistory";
import { MemberStatTiles } from "../components/members/MemberStatTiles";
import { TaskDialogs } from "../components/tasks/TaskDialogs";
import { TaskList } from "../components/tasks/TaskList";
import { useTaskDialogs } from "../components/tasks/useTaskDialogs";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";

function parseMemberId(raw: string | undefined): number | null {
  const parsed = Number(raw);
  return raw !== undefined && Number.isInteger(parsed) ? parsed : null;
}

function UnknownMember({ search }: { search: string }) {
  return (
    <div className="animate-rise">
      <EmptyState
        icon={<UserX className="size-6" />}
        title="Essa pessoa não mora mais aqui"
        hint="O link aponta para alguém que saiu da colmeia."
        action={
          <Link to={{ pathname: "/familia", search }} className="inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
            <ArrowLeft className="size-4" /> Voltar para a família
          </Link>
        }
      />
    </div>
  );
}

export function MemberPage() {
  const now = useNow();
  const { search } = useLocation();
  const { memberId } = useParams();
  const profile = useMemberProfile(parseMemberId(memberId));
  const crown = useCrown();
  const lookup = useMemberLookup();
  const dialogs = useTaskDialogs();
  const goalDialog = useGoalDialog();
  const memberDialog = useDisclosure();

  const { member } = profile;
  if (member === null) return profile.isLoading ? null : <UnknownMember search={search} />;

  const crowned = crown?.member.id === member.id;

  return (
    <div className="space-y-8 animate-rise">
      <div className="flex items-center justify-between gap-3">
        <Link to={{ pathname: "/familia", search }} className="inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
          <ArrowLeft className="size-4" /> Família
        </Link>
        <Button variant="secondary" size="sm" icon={<Pencil className="size-4" />} onClick={memberDialog.open}>Editar</Button>
      </div>

      <MemberHero
        member={member}
        crowned={crowned}
        period={profile.period}
        periodPoints={profile.periodPoints}
        allTimePoints={profile.allTimePoints}
        rank={profile.rank}
        houseSize={profile.houseSize}
      />

      <MemberStatTiles stats={profile.stats} />

      <section>
        <AchievementList achievements={profile.achievements} memberName={member.name} />
      </section>

      <section>
        <SectionHeading
          title={`Metas de ${member.name}`}
          action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(member.id)}>Nova meta</Button>}
        />
        {profile.goals.length === 0 ? (
          <EmptyState icon={<Target className="size-6" />} title={`${member.name} ainda não tem meta`} hint={`Uma recompensa só de ${member.name}, contando os pontos dela.`} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.goals.map((item) => (
              <GoalSummaryCard key={item.goal.id} item={item} onEdit={() => goalDialog.openEdit(item.goal)} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeading title="Tarefas abertas" hint={`Na fila de ${member.name}, as mais urgentes primeiro.`} />
        {profile.openTasks.length === 0 ? (
          <EmptyState icon={<ListChecks className="size-6" />} title="Nada na fila" hint={`Ninguém passou tarefa nenhuma para ${member.name} ainda.`} />
        ) : (
          <TaskList tasks={profile.openTasks} today={now} lookup={lookup} onComplete={dialogs.openComplete} onEdit={dialogs.openEdit} />
        )}
      </section>

      <section>
        <SectionHeading title="Histórico" hint={`Tudo que ${member.name} já fez, da mais recente para a mais antiga.`} />
        {profile.history.length === 0 ? (
          <EmptyState icon={<Sparkles className="size-6" />} title="Nada concluído ainda" hint="A primeira tarefa feita aparece aqui." />
        ) : (
          <MemberHistory completions={profile.history} lookup={lookup} />
        )}
      </section>

      <MemberDialog open={memberDialog.isOpen} member={member} onClose={memberDialog.close} />
      <TaskDialogs dialogs={dialogs} />
      <GoalDialog dialog={goalDialog} />
    </div>
  );
}
