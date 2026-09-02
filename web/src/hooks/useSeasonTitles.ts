import type { SeasonTitle, SeasonTitleInput, SeasonTitleUpdate } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";

const EMPTY: SeasonTitle[] = [];

/** The names the colmeia hands out, in the order the family put them. */
export function useSeasonTitles() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.seasonTitles, () => api.seasonTitles.list());
  return { ...query, titles: query.data ?? EMPTY };
}

export function useSeasonTitleMutations() {
  const api = useApi();
  const invalidates = [ queryKeys.seasonTitles ] as const;
  const create = useAppMutation((input: SeasonTitleInput) => api.seasonTitles.create(input), { invalidates });
  const update = useAppMutation(
    ({ id, input }: { id: number; input: SeasonTitleUpdate }) => api.seasonTitles.update(id, input),
    { invalidates },
  );
  // A title somebody was already called goes quiet instead of away, so what the
  // results read changes too.
  const remove = useAppMutation((id: number) => api.seasonTitles.remove(id), {
    invalidates: [ queryKeys.seasonTitles, queryKeys.votes ],
  });
  return { create, update, remove };
}
