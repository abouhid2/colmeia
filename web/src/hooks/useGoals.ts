import { useQuery } from "@tanstack/react-query";
import type { Goal, GoalInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";

const EMPTY: Goal[] = [];

export function useGoals() {
  const api = useApi();
  const query = useQuery({ queryKey: queryKeys.goals, queryFn: () => api.goals.list() });
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
