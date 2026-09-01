import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import type { Member } from "../domain/types";
import { useDisclosure } from "../hooks/useDisclosure";
import { useGoalOverview } from "../hooks/useGoalOverview";
import { useSession } from "../hooks/useSession";
import { GoalDialog } from "../components/goal/GoalDialog";
import { periodScopeLabel, periodTitle } from "../components/goal/goalCopy";
import { DemoResetCard } from "../components/members/DemoResetCard";
import { HouseholdNameForm } from "../components/members/HouseholdNameForm";
import { Leaderboard } from "../components/members/Leaderboard";
import { MemberCard } from "../components/members/MemberCard";
import { MemberDialog } from "../components/members/MemberDialog";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Segmented } from "../components/ui/Segmented";
import { SectionHeading } from "../components/ui/SectionHeading";

type Scope = "period" | "all";

export function FamilyPage() {
  const { members } = useSession();
  const { goal, standings, allTimeStandings } = useGoalOverview();
  const [scope, setScope] = useState<Scope>("period");
  const [editing, setEditing] = useState<Member | null>(null);
  const memberDialog = useDisclosure();
  const goalDialog = useDisclosure();
  const period = goal?.period ?? "week";

  const openMember = (member: Member | null) => { setEditing(member); memberDialog.open(); };
  const findStanding = (list: typeof standings, member: Member) => list.find((standing) => standing.member.id === member.id);

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Família</h1>
        <div className="mt-3"><HouseholdNameForm /></div>
      </div>

      <section>
        <SectionHeading
          title="Ranking"
          action={<Segmented label="Período do ranking" size="sm" value={scope} onChange={setScope} options={[{ value: "period", label: periodScopeLabel(period) }, { value: "all", label: "Desde sempre" }]} />}
        />
        <Leaderboard standings={scope === "period" ? standings : allTimeStandings} />
      </section>

      <section>
        <SectionHeading title="Quem mora aqui" action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => openMember(null)}>Adicionar</Button>} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} periodStanding={findStanding(standings, member)} allTimeStanding={findStanding(allTimeStandings, member)} onEdit={openMember} />
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading title="Recompensa" />
        <Card className="flex items-center justify-between gap-4 p-5">
          {goal ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">{periodTitle(goal.period)}</p>
              <p className="font-semibold">{goal.title}</p>
              <p className="text-sm text-ink-soft">{goal.targetPoints} pontos</p>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Nenhuma meta definida ainda.</p>
          )}
          <Button variant="secondary" size="sm" icon={<Pencil className="size-4" />} onClick={goalDialog.open}>{goal ? "Ajustar" : "Definir"}</Button>
        </Card>
      </section>

      <DemoResetCard />

      <MemberDialog open={memberDialog.isOpen} member={editing} onClose={memberDialog.close} />
      <GoalDialog open={goalDialog.isOpen} goal={goal} onClose={goalDialog.close} />
    </div>
  );
}
