import { useMemo } from "react";
import { byWindowStart, goalsWithProgress, type GoalWithProgress } from "../domain/goalBoard";
import type { Season } from "../domain/types";
import { useCompletions } from "./useCompletions";
import { useAllGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useSeason } from "./useSeasonContext";

export type SeasonBoards = Record<number, GoalWithProgress[]>;

/** The goals of every estação of the colmeia, so a list of them can draw a roteiro each. */
export function useSeasonBoards(): SeasonBoards {
  const now = useNow();
  const { seasons } = useSeason();
  const { goals } = useAllGoals();
  const { completions } = useCompletions();
  const { members } = useMembers();

  return useMemo(() => {
    const boards: SeasonBoards = {};
    seasons.forEach((season: Season) => {
      boards[season.id] = byWindowStart(goalsWithProgress(goals, completions, members, season, now));
    });
    return boards;
  }, [ seasons, goals, completions, members, now ]);
}
