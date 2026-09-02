import type { Season, SeasonInput, SeasonUpdate } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";

const EMPTY: Season[] = [];

/** The raw list. Screens want `useSeason()`, which also knows which one is current. */
export function useSeasonList() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.seasons, () => api.seasons.list());
  return { ...query, seasons: query.data ?? EMPTY };
}

/** Closing or deleting an estação changes what every other screen is reading. */
const EVERYTHING = [ queryKeys.seasons, queryKeys.tasks, queryKeys.goals, queryKeys.completions ] as const;

export function useSeasonMutations() {
  const api = useApi();
  const create = useAppMutation((input: SeasonInput) => api.seasons.create(input), { invalidates: EVERYTHING });
  const update = useAppMutation(
    ({ id, input }: { id: number; input: Partial<SeasonUpdate> }) => api.seasons.update(id, input),
    { invalidates: [ queryKeys.seasons ] },
  );
  const close = useAppMutation((id: number) => api.seasons.close(id), { invalidates: EVERYTHING });
  const reopen = useAppMutation((id: number) => api.seasons.reopen(id), { invalidates: EVERYTHING });
  const remove = useAppMutation((id: number) => api.seasons.remove(id), { invalidates: EVERYTHING });
  return { create, update, close, reopen, remove };
}
