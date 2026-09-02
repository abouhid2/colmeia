import { useMemo } from "react";
import { crownTitle, votedTitlesIn } from "../domain/seasonTitles";
import { titleResults, type TitleResult } from "../domain/titleResults";
import type { Season, SeasonTitle } from "../domain/types";
import { useMembers } from "./useMembers";
import { useSeasonTitles } from "./useSeasonTitles";
import { useSeasonVotes, useVoteMutations } from "./useSeasonVotes";
import { useSession } from "./useSession";

export interface SeasonVoting {
  /** The title the ranking awards on its own. */
  crown: SeasonTitle | null;
  /** One entry per voted title of this estação, with its tally so far. */
  results: TitleResult[];
  /** Who the person using the app voted for, by title. */
  myVotes: Record<number, number>;
  isLoading: boolean;
  isPending: boolean;
  vote(titleId: number, voteeId: number): void;
  clear(titleId: number): void;
}

const NO_VOTES: Record<number, number> = {};

/** The títulos of one estação, the votes cast in it, and the two ways to change your own. */
export function useSeasonVoting(season: Season | null): SeasonVoting {
  const { titles, isLoading: loadingTitles } = useSeasonTitles();
  const { votes, isLoading: loadingVotes } = useSeasonVotes(season?.id ?? null);
  const { members } = useMembers();
  const { currentMember } = useSession();
  const { cast, clear } = useVoteMutations();

  const results = useMemo(
    () => titleResults(votedTitlesIn(titles, votes), votes, members),
    [ titles, votes, members ],
  );

  const myVotes = useMemo(() => {
    if (currentMember === null) return NO_VOTES;
    const mine = votes.filter((vote) => vote.voterId === currentMember.id);
    return Object.fromEntries(mine.map((vote) => [ vote.seasonTitleId, vote.voteeId ]));
  }, [ votes, currentMember ]);

  const voterId = currentMember?.id ?? null;
  const seasonId = season?.id ?? null;

  return {
    crown: crownTitle(titles),
    results,
    myVotes,
    isLoading: loadingTitles || loadingVotes,
    isPending: cast.isPending || clear.isPending,
    vote: (titleId, voteeId) => {
      if (seasonId === null || voterId === null) return;
      cast.mutate({ seasonId, input: { seasonTitleId: titleId, voterId, voteeId } });
    },
    clear: (titleId) => {
      if (seasonId === null || voterId === null) return;
      clear.mutate({ seasonId, key: { seasonTitleId: titleId, voterId } });
    },
  };
}
