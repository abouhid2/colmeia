import { useMemo } from "react";
import { rankMembers, type Standing } from "../domain/leaderboard";
import { approvedInPeriod, goalProgress, periodBounds, type GoalProgress } from "../domain/progress";
import type { Goal, GoalPeriod, Member } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";

export interface GoalWithProgress {
  goal: Goal;
  progress: GoalProgress;
  member: Member | null;
}

export interface GoalOverview {
  household: GoalWithProgress[];
  personal: GoalWithProgress[];
  /** Period of the main household goal, used for the leaderboard. */
  period: GoalPeriod;
  standings: Standing[];
  allTimeStandings: Standing[];
  isLoading: boolean;
}

/** Everything the home screen and the family page need to talk about points. */
export function useGoalOverview(): GoalOverview {
  const now = useNow();
  const { goals, isLoading: loadingGoals } = useGoals();
  const { completions, isLoading: loadingCompletions } = useCompletions();
  const { members, isLoading: loadingMembers } = useMembers();

  return useMemo(() => {
    const withProgress = goals.map((goal) => ({
      goal,
      progress: goalProgress(goal, completions, now),
      member: members.find((member) => member.id === goal.memberId) ?? null,
    }));
    const household = withProgress.filter((item) => item.goal.memberId === null);
    const personal = withProgress.filter((item) => item.goal.memberId !== null && item.member !== null);
    const period = household[0]?.goal.period ?? "week";
    const inPeriod = approvedInPeriod(completions, periodBounds(period, now));
    return {
      household,
      personal,
      period,
      standings: rankMembers(members, inPeriod),
      allTimeStandings: rankMembers(members, completions),
      isLoading: loadingGoals || loadingCompletions || loadingMembers,
    };
  }, [goals, completions, members, now, loadingGoals, loadingCompletions, loadingMembers]);
}
