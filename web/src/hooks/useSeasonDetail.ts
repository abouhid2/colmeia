import { differenceInCalendarDays } from "date-fns";
import { useMemo } from "react";
import { seasonCrown, type SeasonCrown } from "../domain/crown";
import { byWindowStart, goalsWithProgress, type GoalWithProgress } from "../domain/goalBoard";
import { rankMembers, type Standing } from "../domain/leaderboard";
import { approvedCompletions, seasonBounds } from "../domain/progress";
import { completionsInSeason, isClosed } from "../domain/seasons";
import type { Season } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useAllGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useSeason } from "./useSeasonContext";

export interface SeasonDetail {
  /** null once loading is done means the id in the URL is not an estação of this colmeia. */
  season: Season | null;
  isLoading: boolean;
  isCurrent: boolean;
  closed: boolean;
  standings: Standing[];
  /** Who won it, and whether the colmeia goal that gates the crown was reached. */
  crown: SeasonCrown;
  goals: GoalWithProgress[];
  points: number;
  /** How many days it ran, counting the day it opened. */
  days: number;
}

const NOTHING: SeasonDetail = {
  season: null, isLoading: false, isCurrent: false, closed: false, standings: [],
  crown: { winner: null, goalReached: null }, goals: [], points: 0, days: 0,
};

/** Everything one estação's page says about itself. */
export function useSeasonDetail(seasonId: number | null): SeasonDetail {
  const now = useNow();
  const { seasons, currentSeason, isLoading: loadingSeasons } = useSeason();
  const { goals, isLoading: loadingGoals } = useAllGoals();
  const { completions, isLoading: loadingCompletions } = useCompletions();
  const { members, isLoading: loadingMembers } = useMembers();

  return useMemo(() => {
    const isLoading = loadingSeasons || loadingGoals || loadingCompletions || loadingMembers;
    const season = seasons.find((candidate) => candidate.id === seasonId) ?? null;
    if (season === null) return { ...NOTHING, isLoading };

    const scored = approvedCompletions(completionsInSeason(completions, season.id));
    const bounds = seasonBounds(season, now);

    return {
      season,
      isLoading,
      isCurrent: season.id === currentSeason?.id,
      closed: isClosed(season),
      standings: rankMembers(members, scored),
      crown: seasonCrown(season, { members, completions, goals, now }),
      goals: byWindowStart(goalsWithProgress(goals, completions, members, season, now)),
      points: scored.reduce((sum, completion) => sum + completion.pointsAwarded, 0),
      days: differenceInCalendarDays(bounds.end, bounds.start) + 1,
    };
  }, [ seasons, seasonId, currentSeason, goals, completions, members, now, loadingSeasons, loadingGoals, loadingCompletions, loadingMembers ]);
}
