import { Plus, Target, Trophy } from "lucide-react";
import { useState } from "react";
import {
  byStatus, goalsOf, goalsSeenBy, goalsWithPeople, householdGoals, isOver, type GoalStatusFilter as StatusFilter,
} from "../domain/goalBoard";
import { isClosed } from "../domain/seasons";
import { useGoalOverview } from "../hooks/useGoalOverview";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useNow } from "../hooks/useNow";
import { useSeason } from "../hooks/useSeasonContext";
import { ClosedGoalsSection } from "../components/goal/ClosedGoalsSection";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalGrid } from "../components/goal/GoalGrid";
import { GoalStatusFilter } from "../components/goal/GoalStatusFilter";
import { SeasonRoadmap } from "../components/goal/SeasonRoadmap";
import { useGoalDialog } from "../components/goal/useGoalDialog";
import { MemberFilter } from "../components/members/MemberFilter";
import { NoSeasonState } from "../components/season/NoSeasonState";
import { SeasonClosedNotice } from "../components/season/SeasonClosedNotice";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";

const NOTHING_IN_FILTER = "Nenhuma meta nesse filtro";

/** Every meta of the estação on one screen: the roteiro, then who each one is for. */
export function GoalsPage() {
  const now = useNow();
  const { currentSeason, isLoading: loadingSeasons } = useSeason();
  const { all } = useGoalOverview();
  const { memberId, member: filtered } = useMemberFilter();
  const goalDialog = useGoalDialog();
  const [ status, setStatus ] = useState<StatusFilter>("all");

  if (currentSeason === null) return loadingSeasons ? null : <NoSeasonState />;

  const closed = isClosed(currentSeason);
  const shown = byStatus(all, status);
  const running = shown.filter((item) => !isOver(item, now));
  const colmeia = householdGoals(running);
  const people = goalsOf(goalsWithPeople(running), memberId);
  const over = goalsSeenBy(shown.filter((item) => isOver(item, now)), memberId);
  const filteredByStatus = status !== "all";

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
        {!closed && (
          <Button icon={<Plus className="size-4" />} onClick={() => goalDialog.openCreate(memberId, currentSeason.id)}>
            Nova meta
          </Button>
        )}
      </div>
      {closed && <SeasonClosedNotice name={currentSeason.name} />}
      <MemberFilter />

      {all.length > 0 && (
        <section>
          <SectionHeading title="Roteiro da estação" />
          <SeasonRoadmap goals={all} now={now} onSelect={closed ? undefined : goalDialog.openEdit} />
        </section>
      )}

      <div className="flex justify-end">
        <GoalStatusFilter value={status} onChange={setStatus} />
      </div>

      <section>
        <SectionHeading title="Da colmeia inteira" />
        {colmeia.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-6" />}
            title={filteredByStatus ? NOTHING_IN_FILTER : "Nenhuma meta da colmeia ainda"}
            hint={filteredByStatus ? undefined : "Combinem uma recompensa e quantos pontos ela custa."}
          />
        ) : (
          <GoalGrid items={colmeia} readOnly={closed} onEdit={goalDialog.openEdit} />
        )}
      </section>

      <section>
        <SectionHeading title="De pessoas e grupos" />
        {people.length === 0 ? (
          <EmptyState
            icon={<Target className="size-6" />}
            title={
              filteredByStatus ? NOTHING_IN_FILTER
                : filtered ? `${filtered.name} não está em nenhuma meta`
                  : "Ninguém está em uma meta ainda"
            }
          />
        ) : (
          <GoalGrid items={people} readOnly={closed} onEdit={goalDialog.openEdit} />
        )}
      </section>

      <ClosedGoalsSection items={over} readOnly={closed} onEdit={goalDialog.openEdit} />

      <GoalDialog dialog={goalDialog} />
    </div>
  );
}
