import { useMemo } from "react";
import {
  byWindowStart, goalAudience, goalsWithPeople, goalsWithProgress, householdGoals, type GoalWithProgress,
} from "../domain/goalBoard";
import { rankMembers, type Standing } from "../domain/leaderboard";
import { completionsInSeason } from "../domain/seasons";
import type { Season } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useSeason } from "./useSeasonContext";

export type { GoalWithProgress } from "../domain/goalBoard";

export interface GoalOverview {
  /** Every goal of the estação on screen, earliest window first. */
  all: GoalWithProgress[];
  /** The ones the whole colmeia works towards. */
  household: GoalWithProgress[];
  /** One person named. */
  personal: GoalWithProgress[];
  /** Two or more people named. */
  shared: GoalWithProgress[];
  /** Everything somebody is named in, personal and em grupo together. */
  withPeople: GoalWithProgress[];
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
    if (currentSeason === null) {
      return {
        all: NO_GOALS, household: NO_GOALS, personal: NO_GOALS, shared: NO_GOALS, withPeople: NO_GOALS,
        season: null, standings: [], allTimeStandings: [], isLoading,
      };
    }

    const all = byWindowStart(goalsWithProgress(goals, completions, members, currentSeason, now));
    const withPeople = goalsWithPeople(all);

    return {
      all,
      household: householdGoals(all),
      personal: withPeople.filter((item) => goalAudience(item.goal) === "personal"),
      shared: withPeople.filter((item) => goalAudience(item.goal) === "group"),
      withPeople,
      season: currentSeason,
      standings: rankMembers(members, completionsInSeason(completions, currentSeason.id)),
      allTimeStandings: rankMembers(members, completions),
      isLoading,
    };
  }, [ goals, completions, members, currentSeason, now, loadingSeasons, loadingGoals, loadingCompletions, loadingMembers ]);
}
