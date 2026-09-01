import { useMemo } from "react";
import { rankMembers, type Standing } from "../domain/leaderboard";
import { approvedInPeriod, goalProgress, periodBounds, type GoalProgress } from "../domain/progress";
import type { Goal } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useGoal } from "./useGoal";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";

export interface GoalOverview {
  goal: Goal | null;
  progress: GoalProgress | null;
  standings: Standing[];
  allTimeStandings: Standing[];
  isLoading: boolean;
}

/** Everything the home screen and the family page need to talk about points. */
export function useGoalOverview(): GoalOverview {
  const now = useNow();
  const goalQuery = useGoal();
  const { completions, isLoading: loadingCompletions } = useCompletions();
  const { members, isLoading: loadingMembers } = useMembers();
  const goal = goalQuery.data ?? null;

  return useMemo(() => {
    const period = goal?.period ?? "week";
    const inPeriod = approvedInPeriod(completions, periodBounds(period, now));
    return {
      goal,
      progress: goal ? goalProgress(goal, completions, now) : null,
      standings: rankMembers(members, inPeriod),
      allTimeStandings: rankMembers(members, completions),
      isLoading: goalQuery.isLoading || loadingCompletions || loadingMembers,
    };
  }, [goal, completions, members, now, goalQuery.isLoading, loadingCompletions, loadingMembers]);
}
