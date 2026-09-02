import { useMemo } from "react";
import { crownHolder, type Crown } from "../domain/crown";
import { useCompletions } from "./useCompletions";
import { useAllGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useSeason } from "./useSeasonContext";

/** Who is wearing the crown, for having won the estação that closed last. */
export function useCrown(): Crown | null {
  const now = useNow();
  const { seasons } = useSeason();
  const { goals } = useAllGoals();
  const { completions } = useCompletions();
  const { members } = useMembers();

  return useMemo(
    () => crownHolder({ members, completions, seasons, goals, now }),
    [ members, completions, seasons, goals, now ],
  );
}
