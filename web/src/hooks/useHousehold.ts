import type { Household } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";

export function useHousehold() {
  const api = useApi();
  return useScopedQuery(queryKeys.household, () => api.household.get());
}

export function useRenameHousehold() {
  const api = useApi();
  return useAppMutation((input: Pick<Household, "name">) => api.household.update(input), {
    invalidates: [queryKeys.household],
  });
}
