import { useQuery } from "@tanstack/react-query";
import type { GoalInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";

export function useGoal() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.goal, queryFn: () => api.goal.get() });
}

export function useSaveGoal() {
  const api = useApi();
  return useAppMutation((input: GoalInput) => api.goal.update(input), { invalidates: [queryKeys.goal] });
}
