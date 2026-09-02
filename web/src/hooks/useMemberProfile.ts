import { useMemo } from "react";
import { completionsForMember } from "../domain/history";
import { memberStats, type MemberStats } from "../domain/memberStats";
import { sortOpenTasks } from "../domain/taskSort";
import type { Completion, Member, Season, Task } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { goalsOf } from "../domain/goalBoard";
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
  season: Season | null;
  seasonPoints: number;
  allTimePoints: number;
  /** 1-based place in the estação ranking, out of everyone in the house. */
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
  const { withPeople, season, standings, allTimeStandings, isLoading: loadingGoals } = useGoalOverview();

  const isLoading = loadingMembers || loadingCompletions || loadingTasks || loadingGoals;
  const member = memberId === null ? null : (members.find((candidate) => candidate.id === memberId) ?? null);
  const badges = useMemberAchievements(member);

  return useMemo(() => {
    if (member === null) {
      return {
        member: null, isLoading, stats: NO_STATS, season, seasonPoints: 0, allTimePoints: 0,
        rank: null, houseSize: members.length, badges, history: [], openTasks: [], goals: [],
      };
    }

    const place = standings.findIndex((standing) => standing.member.id === member.id);

    return {
      member,
      isLoading,
      stats: memberStats(member.id, completions),
      season,
      seasonPoints: standings[place]?.points ?? 0,
      allTimePoints: allTimeStandings.find((standing) => standing.member.id === member.id)?.points ?? 0,
      rank: place === -1 ? null : place + 1,
      houseSize: standings.length,
      badges,
      // The history spans every estação: what this person did is theirs for good.
      history: completionsForMember(completions, member.id),
      openTasks: sortOpenTasks(tasks.filter((task) => task.status === "open" && task.assigneeIds.includes(member.id)), now),
      // Every goal this person is in, alone or with somebody else.
      goals: goalsOf(withPeople, member.id),
    };
  }, [member, members, completions, tasks, withPeople, season, standings, allTimeStandings, now, isLoading, badges]);
}
