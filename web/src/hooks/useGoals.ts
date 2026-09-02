import type { Goal, GoalInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";
import { useSeason } from "./useSeasonContext";

const EMPTY: Goal[] = [];

/** The goals of the estação the app is showing. */
export function useGoals() {
  const api = useApi();
  const { currentSeason } = useSeason();
  const seasonId = currentSeason?.id ?? null;
  const query = useScopedQuery(queryKeys.goals, () => api.goals.list(seasonId), {
    scope: [ seasonId ],
    enabled: seasonId !== null,
  });
  return { ...query, goals: query.data ?? EMPTY };
}

/** Every goal of the colmeia, estações included: what the crown reads. */
export function useAllGoals() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.goals, () => api.goals.list(null), { scope: [ "todas" ] });
  return { ...query, goals: query.data ?? EMPTY };
}

export function useGoalMutations() {
  const api = useApi();
  const invalidates = [queryKeys.goals] as const;
  const create = useAppMutation((input: GoalInput) => api.goals.create(input), { invalidates });
  const update = useAppMutation(
    ({ id, input }: { id: number; input: Partial<GoalInput> }) => api.goals.update(id, input),
    { invalidates },
  );
  const remove = useAppMutation((id: number) => api.goals.remove(id), { invalidates });
  return { create, update, remove };
}
