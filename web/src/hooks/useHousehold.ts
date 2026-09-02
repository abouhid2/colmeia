import type { HouseholdUpdate } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";

export function useHousehold() {
  const api = useApi();
  return useScopedQuery(queryKeys.household, () => api.household.get());
}

export function useUpdateHousehold() {
  const api = useApi();
  return useAppMutation((input: HouseholdUpdate) => api.household.update(input), {
    invalidates: [queryKeys.household],
  });
}
