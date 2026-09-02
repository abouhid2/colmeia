import { useMemo } from "react";
import { memberAchievements, type Achievement } from "../domain/achievements";
import { memberStats, type MemberStats } from "../domain/memberStats";
import { sortOpenTasks } from "../domain/taskSort";
import type { Completion, Member, Season, Task } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useGoalOverview, type GoalWithProgress } from "./useGoalOverview";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useAllTasks, useTasks } from "./useTasks";

export interface MemberProfile {
  /** null once loading is done means the id in the URL is not a real person. */
  member: Member | null;
  isLoading: boolean;
  stats: MemberStats;
  season: Season | null;
  seasonPoints: number;
  allTimePoints: number;
  /** 1-based place in the estação ranking, out of everyone in the house. */
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
  // Badges are colmeia-wide, so they read every estação, not just this one.
  const { tasks: allTasks } = useAllTasks();
  const { personal, season, standings, allTimeStandings, isLoading: loadingGoals } = useGoalOverview();

  const isLoading = loadingMembers || loadingCompletions || loadingTasks || loadingGoals;

  return useMemo(() => {
    const member = memberId === null ? null : (members.find((candidate) => candidate.id === memberId) ?? null);
    if (member === null) {
      return {
        member: null, isLoading, stats: NO_STATS, season, seasonPoints: 0, allTimePoints: 0,
        rank: null, houseSize: members.length, achievements: [], history: [], openTasks: [], goals: [],
      };
    }

    const place = standings.findIndex((standing) => standing.member.id === member.id);
    // The history spans every estação: what this person did is theirs for good.
    const history = completions
      .filter((completion) => completion.memberId === member.id)
      .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt));

    return {
      member,
      isLoading,
      stats: memberStats(member.id, completions),
      season,
      seasonPoints: standings[place]?.points ?? 0,
      allTimePoints: allTimeStandings.find((standing) => standing.member.id === member.id)?.points ?? 0,
      rank: place === -1 ? null : place + 1,
      houseSize: standings.length,
      achievements: memberAchievements({ memberId: member.id, completions, tasks: allTasks }),
      history,
      openTasks: sortOpenTasks(tasks.filter((task) => task.status === "open" && task.assigneeId === member.id), now),
      goals: personal.filter((item) => item.goal.memberId === member.id),
    };
  }, [memberId, members, completions, tasks, allTasks, personal, season, standings, allTimeStandings, now, isLoading]);
}
