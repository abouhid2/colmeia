import { useMemo } from "react";
import { memberStats, type MemberStats } from "../domain/memberStats";
import { sortOpenTasks } from "../domain/taskSort";
import type { Completion, GoalPeriod, Member, Task } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useGoalOverview, type GoalWithProgress } from "./useGoalOverview";
import { useMemberAchievements, type MemberAchievements } from "./useMemberAchievements";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useTasks } from "./useTasks";

export interface MemberProfile {
  /** null once loading is done means the id in the URL is not a real person. */
  member: Member | null;
  isLoading: boolean;
  stats: MemberStats;
  period: GoalPeriod;
  periodPoints: number;
  allTimePoints: number;
  /** 1-based place in the period ranking, out of everyone in the house. */
  rank: number | null;
  houseSize: number;
  badges: MemberAchievements;
  history: Completion[];
  openTasks: Task[];
  goals: GoalWithProgress[];
}

const NO_STATS: MemberStats = { tasksCount: 0, points: 0, averageRating: null, reviewsGiven: 0 };

/** Everything one person's page needs, read off the same data as every other screen. */
export function useMemberProfile(memberId: number | null): MemberProfile {
  const now = useNow();
  const { members, isLoading: loadingMembers } = useMembers();
  const { completions, isLoading: loadingCompletions } = useCompletions();
  const { tasks, isLoading: loadingTasks } = useTasks();
  const { personal, period, standings, allTimeStandings, isLoading: loadingGoals } = useGoalOverview();

  const isLoading = loadingMembers || loadingCompletions || loadingTasks || loadingGoals;
  const member = memberId === null ? null : (members.find((candidate) => candidate.id === memberId) ?? null);
  const badges = useMemberAchievements(member);

  return useMemo(() => {
    if (member === null) {
      return {
        member: null, isLoading, stats: NO_STATS, period, periodPoints: 0, allTimePoints: 0,
        rank: null, houseSize: members.length, badges, history: [], openTasks: [], goals: [],
      };
    }

    const place = standings.findIndex((standing) => standing.member.id === member.id);
    const history = completions
      .filter((completion) => completion.memberId === member.id)
      .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt));

    return {
      member,
      isLoading,
      stats: memberStats(member.id, completions),
      period,
      periodPoints: standings[place]?.points ?? 0,
      allTimePoints: allTimeStandings.find((standing) => standing.member.id === member.id)?.points ?? 0,
      rank: place === -1 ? null : place + 1,
      houseSize: standings.length,
      badges,
      history,
      openTasks: sortOpenTasks(tasks.filter((task) => task.status === "open" && task.assigneeId === member.id), now),
      goals: personal.filter((item) => item.goal.memberId === member.id),
    };
  }, [member, members, completions, tasks, personal, period, standings, allTimeStandings, now, isLoading, badges]);
}
