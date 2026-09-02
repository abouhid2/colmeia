import { CalendarRange, Plus, Target } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { CROWN_EXPLANATION } from "../domain/crownTitles";
import { isClosed } from "../domain/seasons";
import type { Member } from "../domain/types";
import { useCrown } from "../hooks/useCrown";
import { useDisclosure } from "../hooks/useDisclosure";
import { useGoalOverview } from "../hooks/useGoalOverview";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useSeason } from "../hooks/useSeasonContext";
import { useSession } from "../hooks/useSession";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalSummaryCard } from "../components/goal/GoalSummaryCard";
import { ALL_TIME_SCOPE_LABEL, SEASON_SCOPE_LABEL } from "../components/goal/goalCopy";
import { useGoalDialog } from "../components/goal/useGoalDialog";
import { ColmeiaCard } from "../components/household/ColmeiaCard";
import { DemoResetCard } from "../components/members/DemoResetCard";
import { HouseholdNameForm } from "../components/members/HouseholdNameForm";
import { LagartinhaLeague } from "../components/members/LagartinhaLeague";
import { Leaderboard } from "../components/members/Leaderboard";
import { MemberCard } from "../components/members/MemberCard";
import { MemberDialog } from "../components/members/MemberDialog";
import { MemberFilter } from "../components/members/MemberFilter";
import { NoSeasonState } from "../components/season/NoSeasonState";
import { SeasonClosedNotice } from "../components/season/SeasonClosedNotice";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Segmented } from "../components/ui/Segmented";
import { SectionHeading } from "../components/ui/SectionHeading";

type Scope = "season" | "all";

export function FamilyPage() {
  const { search } = useLocation();
  const { members } = useSession();
  const { currentSeason, isLoading: loadingSeasons } = useSeason();
  const { memberId, member: filtered } = useMemberFilter();
  const { household, personal, standings, allTimeStandings } = useGoalOverview();
  const crown = useCrown();
  const [scope, setScope] = useState<Scope>("season");
  const [editing, setEditing] = useState<Member | null>(null);
  const memberDialog = useDisclosure();
  const goalDialog = useGoalDialog();

  if (currentSeason === null) return loadingSeasons ? null : <NoSeasonState />;

  const closed = isClosed(currentSeason);
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
      {closed && <SeasonClosedNotice name={currentSeason.name} />}
      <MemberFilter />

      <section>
        <SectionHeading
          title="Ranking"
          action={<Segmented label="Período do ranking" size="sm" value={scope} onChange={setScope} options={[{ value: "season", label: SEASON_SCOPE_LABEL }, { value: "all", label: ALL_TIME_SCOPE_LABEL }]} />}
        />
        <Leaderboard standings={scope === "season" ? standings : allTimeStandings} crownedMemberId={crown?.member.id ?? null} />
      </section>

      <LagartinhaLeague standings={scope === "season" ? standings : allTimeStandings} />

      <section>
        <SectionHeading title="Quem mora aqui" hint={CROWN_EXPLANATION} action={<Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => openMember(null)}>Adicionar</Button>} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {shownMembers.map((member) => (
            <MemberCard key={member.id} member={member} seasonStanding={findStanding(standings, member)} allTimeStanding={findStanding(allTimeStandings, member)} crowned={crown?.member.id === member.id} onEdit={openMember} />
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading
          title="Recompensas"
          hint="Uma meta para a casa e quantas individuais quiserem."
          action={closed ? undefined : <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(memberId)}>Nova meta</Button>}
        />
        {shownGoals.length === 0 ? (
          <EmptyState icon={<Target className="size-6" />} title="Nenhuma meta ainda" hint={filtered ? `Crie uma recompensa para ${filtered.name}.` : "Combinem uma recompensa e uma quantidade de pontos."} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {shownGoals.map((item) => (
              <GoalSummaryCard key={item.goal.id} item={item} readOnly={closed} onEdit={() => goalDialog.openEdit(item.goal)} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeading title="Estações" hint="Cada campeonato com as suas tarefas, metas e ranking." />
        <Link
          to={{ pathname: "/estacoes", search }}
          className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card hover:bg-dune-100"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-honey-100 text-honey-700"><CalendarRange className="size-5" /></span>
          <span className="min-w-0">
            <span className="block font-semibold">Gerenciar estações</span>
            <span className="block text-sm text-ink-soft">Agora em {currentSeason.name}.</span>
          </span>
        </Link>
      </section>

      <section>
        <SectionHeading title="Esta colmeia" />
        <ColmeiaCard />
      </section>

      <DemoResetCard />

      <MemberDialog open={memberDialog.isOpen} member={editing} onClose={memberDialog.close} />
      <GoalDialog dialog={goalDialog} />
    </div>
  );
}
