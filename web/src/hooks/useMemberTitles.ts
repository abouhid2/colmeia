import { useMemo } from "react";
import { memberTitles, type MemberTitleAward } from "../domain/memberTitles";
import { useCompletions } from "./useCompletions";
import { useAllGoals } from "./useGoals";
import { useMembers } from "./useMembers";
import { useNow } from "./useNow";
import { useSeason } from "./useSeasonContext";
import { useSeasonTitles } from "./useSeasonTitles";
import { useAllVotes } from "./useSeasonVotes";

/** Everything one person was called, across every estação already closed. */
export function useMemberTitles(memberId: number | null): MemberTitleAward[] {
  const now = useNow();
  const { seasons } = useSeason();
  const { titles } = useSeasonTitles();
  const { votes } = useAllVotes();
  const { members } = useMembers();
  const { completions } = useCompletions();
  const { goals } = useAllGoals();

  return useMemo(
    () => (memberId === null ? [] : memberTitles({ memberId, seasons, titles, votes, members, completions, goals, now })),
    [ memberId, seasons, titles, votes, members, completions, goals, now ],
  );
}
