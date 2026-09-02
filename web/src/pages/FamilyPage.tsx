import { Plus, Target } from "lucide-react";
import { useState } from "react";
import type { Member } from "../domain/types";
import { useCrown } from "../hooks/useCrown";
import { useDisclosure } from "../hooks/useDisclosure";
import { useGoalOverview } from "../hooks/useGoalOverview";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useSession } from "../hooks/useSession";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalSummaryCard } from "../components/goal/GoalSummaryCard";
import { crownExplanation } from "../domain/crownTitles";
import { periodScopeLabel } from "../components/goal/goalCopy";
import { useGoalDialog } from "../components/goal/useGoalDialog";
import { ColmeiaCard } from "../components/household/ColmeiaCard";
import { ExampleResetCard } from "../components/members/ExampleResetCard";
import { HouseholdNameForm } from "../components/members/HouseholdNameForm";
import { LagartinhaLeague } from "../components/members/LagartinhaLeague";
import { Leaderboard } from "../components/members/Leaderboard";
import { MemberCard } from "../components/members/MemberCard";
import { MemberDialog } from "../components/members/MemberDialog";
import { MemberFilter } from "../components/members/MemberFilter";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Segmented } from "../components/ui/Segmented";
import { SectionHeading } from "../components/ui/SectionHeading";

type Scope = "period" | "all";

export function FamilyPage() {
  const { members } = useSession();
  const { memberId, member: filtered } = useMemberFilter();
  const { household, personal, period, standings, allTimeStandings } = useGoalOverview();
  const crown = useCrown();
  const [scope, setScope] = useState<Scope>("period");
  const [editing, setEditing] = useState<Member | null>(null);
  const memberDialog = useDisclosure();
  const goalDialog = useGoalDialog();

  const openMember = (member: Member | null) => { setEditing(member); memberDialog.open(); };
  const findStanding = (list: typeof standings, member: Member) => list.find((standing) => standing.member.id === member.id);
  const shownMembers = memberId === null ? members : members.filter((member) => member.id === memberId);
  const shownGoals = [...household, ...personal].filter((item) => memberId === null || item.goal.memberId === memberId || item.goal.memberId === null);

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Família</h1>
        <div className="mt-3"><HouseholdNameForm /></div>
      </div>
      <MemberFilter />

      <section>
        <SectionHeading
          title="Ranking"
          action={<Segmented label="Período do ranking" size="sm" value={scope} onChange={setScope} options={[{ value: "period", label: periodScopeLabel(period) }, { value: "all", label: "Desde sempre" }]} />}
        />
        <Leaderboard standings={scope === "period" ? standings : allTimeStandings} crownedMemberId={crown?.member.id ?? null} period={period} />
      </section>

      <LagartinhaLeague standings={scope === "period" ? standings : allTimeStandings} />

      <section>
        <SectionHeading title="Quem mora aqui" hint={crownExplanation(period)} action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => openMember(null)}>Adicionar pessoa</Button>} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {shownMembers.map((member) => (
            <MemberCard key={member.id} member={member} periodStanding={findStanding(standings, member)} allTimeStanding={findStanding(allTimeStandings, member)} crowned={crown?.member.id === member.id} period={period} onEdit={openMember} />
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading
          title="Recompensas"
          hint="Uma meta para a colmeia inteira e quantas individuais quiserem."
          action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(memberId)}>Nova meta</Button>}
        />
        {shownGoals.length === 0 ? (
          <EmptyState icon={<Target className="size-6" />} title="Nenhuma meta ainda" hint={filtered ? `Combinem uma recompensa para ${filtered.name}.` : "Combinem uma recompensa e quantos pontos ela custa."} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {shownGoals.map((item) => (
              <GoalSummaryCard key={item.goal.id} item={item} onEdit={() => goalDialog.openEdit(item.goal)} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeading title="Esta colmeia" />
        <ColmeiaCard />
      </section>

      <ExampleResetCard />

      <MemberDialog open={memberDialog.isOpen} member={editing} onClose={memberDialog.close} />
      <GoalDialog dialog={goalDialog} />
    </div>
  );
}
