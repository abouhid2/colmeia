import type { SeasonTitleVote, VoteInput, VoteKey } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";

const EMPTY: SeasonTitleVote[] = [];

/** What the family voted inside one estação. */
export function useSeasonVotes(seasonId: number | null) {
  const api = useApi();
  const query = useScopedQuery(queryKeys.votes, () => api.votes.list(seasonId), {
    scope: [ seasonId ],
    enabled: seasonId !== null,
  });
  return { ...query, votes: query.data ?? EMPTY };
}

/** Every vote of the colmeia: what a profile counts its titles from. */
export function useAllVotes() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.votes, () => api.votes.list(null), { scope: [ "todas" ] });
  return { ...query, votes: query.data ?? EMPTY };
}

export function useVoteMutations() {
  const api = useApi();
  const invalidates = [ queryKeys.votes ] as const;
  const cast = useAppMutation(
    ({ seasonId, input }: { seasonId: number; input: VoteInput }) => api.votes.cast(seasonId, input),
    { invalidates },
  );
  const clear = useAppMutation(
    ({ seasonId, key }: { seasonId: number; key: VoteKey }) => api.votes.clear(seasonId, key),
    { invalidates },
  );
  return { cast, clear };
}
