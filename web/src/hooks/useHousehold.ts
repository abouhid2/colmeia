import { useQuery } from "@tanstack/react-query";
import type { Household } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";

export function useHousehold() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.household, queryFn: () => api.household.get() });
}

export function useRenameHousehold() {
  const api = useApi();
  return useAppMutation((input: Pick<Household, "name">) => api.household.update(input), {
    invalidates: [queryKeys.household],
  });
}
