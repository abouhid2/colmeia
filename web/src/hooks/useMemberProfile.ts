import { useMemo } from "react";
import { memberAchievements, type Achievement } from "../domain/achievements";
import { completionsForMember } from "../domain/history";
import { memberStats, type MemberStats } from "../domain/memberStats";
import { sortOpenTasks } from "../domain/taskSort";
import type { Completion, GoalPeriod, Member, Task } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useGoalOverview, type GoalWithProgress } from "./useGoalOverview";
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
  achievements: Achievement[];
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

  return useMemo(() => {
    const member = memberId === null ? null : (members.find((candidate) => candidate.id === memberId) ?? null);
    if (member === null) {
      return {
        member: null, isLoading, stats: NO_STATS, period, periodPoints: 0, allTimePoints: 0,
        rank: null, houseSize: members.length, achievements: [], history: [], openTasks: [], goals: [],
      };
    }

    const place = standings.findIndex((standing) => standing.member.id === member.id);

    return {
      member,
      isLoading,
      stats: memberStats(member.id, completions),
      period,
      periodPoints: standings[place]?.points ?? 0,
      allTimePoints: allTimeStandings.find((standing) => standing.member.id === member.id)?.points ?? 0,
      rank: place === -1 ? null : place + 1,
      houseSize: standings.length,
      achievements: memberAchievements({ memberId: member.id, completions, tasks }),
      history: completionsForMember(completions, member.id),
      openTasks: sortOpenTasks(tasks.filter((task) => task.status === "open" && task.assigneeId === member.id), now),
      goals: personal.filter((item) => item.goal.memberId === member.id),
    };
  }, [memberId, members, completions, tasks, personal, period, standings, allTimeStandings, now, isLoading]);
}
