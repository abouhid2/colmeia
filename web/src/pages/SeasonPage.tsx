import { ArrowLeft, CalendarX, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { GoalDialog } from "../components/goal/GoalDialog";
import { GoalSummaryCard } from "../components/goal/GoalSummaryCard";
import { SeasonRoadmap } from "../components/goal/SeasonRoadmap";
import { useGoalDialog } from "../components/goal/useGoalDialog";
import { Leaderboard } from "../components/members/Leaderboard";
import { CloseSeasonDialog } from "../components/season/CloseSeasonDialog";
import { SeasonDialog } from "../components/season/SeasonDialog";
import { SeasonNumbers } from "../components/season/SeasonNumbers";
import { SeasonPageHeader } from "../components/season/SeasonPageHeader";
import { SeasonTitlesSection } from "../components/season/SeasonTitlesSection";
import { crownVerdict } from "../components/season/titleCopy";
import { useSeasonDialog } from "../components/season/useSeasonDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useNow } from "../hooks/useNow";
import { useSeason } from "../hooks/useSeasonContext";
import { useSeasonDetail } from "../hooks/useSeasonDetail";
import { useSeasonMutations } from "../hooks/useSeasons";
import { useSeasonVoting } from "../hooks/useSeasonVoting";
import { useSession } from "../hooks/useSession";
import { useToast } from "../hooks/useToast";

function parseSeasonId(raw: string | undefined): number | null {
  const parsed = Number(raw);
  return raw !== undefined && Number.isInteger(parsed) ? parsed : null;
}

function UnknownSeason({ search }: { search: string }) {
  return (
    <div className="animate-rise">
      <EmptyState
        icon={<CalendarX className="size-6" />}
        title="Essa estação não existe mais"
        hint="O link aponta para um campeonato que saiu da colmeia."
        action={
          <Link to={{ pathname: "/estacoes", search }} className="inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
            <ArrowLeft className="size-4" /> Voltar para as estações
          </Link>
        }
      />
    </div>
  );
}

export function SeasonPage() {
  const now = useNow();
  const { search } = useLocation();
  const navigate = useNavigate();
  const detail = useSeasonDetail(parseSeasonId(useParams().seasonId));
  const voting = useSeasonVoting(detail.season);
  const { setCurrentSeasonId } = useSeason();
  const { currentMember } = useSession();
  const { close, reopen, remove } = useSeasonMutations();
  const { notify } = useToast();
  const seasonDialog = useSeasonDialog();
  const goalDialog = useGoalDialog();
  const [ closing, setClosing ] = useState(false);
  const [ confirmingDelete, setConfirmingDelete ] = useState(false);

  const { season, closed } = detail;
  if (season === null) return detail.isLoading ? null : <UnknownSeason search={search} />;

  const verdict = crownVerdict(detail.crown.goalReached, detail.crown.winner !== null);

  const askDelete = () => {
    if (!confirmingDelete) { setConfirmingDelete(true); return; }
    remove.mutate(season.id, {
      onSuccess: () => { notify({ message: `${season.name} apagada` }); navigate({ pathname: "/estacoes", search }); },
    });
  };

  return (
    <div className="space-y-8 animate-rise">
      <SeasonPageHeader
        season={season}
        isCurrent={detail.isCurrent}
        search={search}
        confirmingDelete={confirmingDelete}
        onSelect={() => setCurrentSeasonId(season.id)}
        onEdit={() => seasonDialog.openEdit(season)}
        onClose={() => setClosing(true)}
        onReopen={() => reopen.mutate(season.id, { onSuccess: () => notify({ message: `${season.name} reaberta` }) })}
        onDelete={askDelete}
      />

      <section>
        <SectionHeading title="Ranking da estação" hint={closed ? (verdict ?? undefined) : undefined} />
        {detail.standings.length === 0 ? (
          <EmptyState icon={<Trophy className="size-6" />} title="Ninguém pontuou nesta estação" />
        ) : (
          <Leaderboard standings={detail.standings} crownedMemberId={detail.crown.winner?.member.id ?? null} />
        )}
      </section>

      <section>
        <SectionHeading title="Metas" />
        {detail.goals.length === 0 ? (
          <EmptyState icon={<Target className="size-6" />} title="Nenhuma meta nesta estação" />
        ) : (
          <>
            <SeasonRoadmap goals={detail.goals} now={now} onSelect={closed ? undefined : goalDialog.openEdit} />
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {detail.goals.map((item) => (
                <GoalSummaryCard key={item.goal.id} item={item} readOnly={closed} onEdit={() => goalDialog.openEdit(item.goal)} />
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <SectionHeading title="Números" />
        <SeasonNumbers season={season} points={detail.points} days={detail.days} />
      </section>

      <SeasonTitlesSection voting={voting} crown={detail.crown} closed={closed} me={currentMember} />

      <SeasonDialog dialog={seasonDialog} />
      <GoalDialog dialog={goalDialog} />
      <CloseSeasonDialog
        season={closing ? season : null}
        isPending={close.isPending}
        onCancel={() => setClosing(false)}
        onConfirm={() => close.mutate(season.id, {
          onSuccess: () => { notify({ tone: "success", message: `${season.name} encerrada` }); setClosing(false); },
        })}
      />
    </div>
  );
}
