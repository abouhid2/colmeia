import { useMemo } from "react";
import { rankMembers, type Standing } from "../domain/leaderboard";
import { goalProgress, type GoalProgress } from "../domain/progress";
import { completionsInSeason } from "../domain/seasons";
import type { Goal, Member, Season } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useSeason } from "./useSeasonContext";

export interface GoalWithProgress {
  goal: Goal;
  progress: GoalProgress;
  /** The estação the goal belongs to, for the dates on its card. */
  season: Season;
  member: Member | null;
  /** Who contributed inside this goal's own estação. */
  standings: Standing[];
}

export interface GoalOverview {
  household: GoalWithProgress[];
  personal: GoalWithProgress[];
  /** The estação every number here belongs to. */
  season: Season | null;
  standings: Standing[];
  allTimeStandings: Standing[];
  isLoading: boolean;
}

const NO_GOALS: GoalWithProgress[] = [];

/** Everything the home screen and the family page need to talk about points. */
export function useGoalOverview(): GoalOverview {
  const now = useNow();
  const { currentSeason, isLoading: loadingSeasons } = useSeason();
  const { goals, isLoading: loadingGoals } = useGoals();
  const { completions, isLoading: loadingCompletions } = useCompletions();
  const { members, isLoading: loadingMembers } = useMembers();

  return useMemo(() => {
    const isLoading = loadingSeasons || loadingGoals || loadingCompletions || loadingMembers;
    const inSeason = completionsInSeason(completions, currentSeason?.id ?? null);
    if (currentSeason === null) {
      return { household: NO_GOALS, personal: NO_GOALS, season: null, standings: [], allTimeStandings: [], isLoading };
    }

    const withProgress = goals.map((goal) => ({
      goal,
      progress: goalProgress(goal, completions, currentSeason, now),
      season: currentSeason,
      member: members.find((member) => member.id === goal.memberId) ?? null,
      standings: rankMembers(members, completionsInSeason(completions, goal.seasonId)),
    }));

    return {
      household: withProgress.filter((item) => item.goal.memberId === null),
      personal: withProgress.filter((item) => item.goal.memberId !== null && item.member !== null),
      season: currentSeason,
      standings: rankMembers(members, inSeason),
      allTimeStandings: rankMembers(members, completions),
      isLoading,
    };
  }, [ goals, completions, members, currentSeason, now, loadingSeasons, loadingGoals, loadingCompletions, loadingMembers ]);
}
