import { useMemo } from "react";
import { crownHolder, type Crown } from "../domain/crown";
import { useCompletions } from "./useCompletions";
import { useGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";

/** Who is wearing the crown right now, for having won the period just gone. */
export function useCrown(): Crown | null {
  const now = useNow();
  const { goals } = useGoals();
  const { completions } = useCompletions();
  const { members } = useMembers();

  return useMemo(() => {
    const household = goals.find((goal) => goal.memberId === null) ?? null;
    return crownHolder({ members, completions, goal: household, now });
  }, [goals, completions, members, now]);
}
