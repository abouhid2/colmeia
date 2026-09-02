import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import type { HouseholdInput, HouseholdWithMembers } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useSessionContext } from "./useSessionContext";

export function useCreateHousehold() {
  const api = useApi();
  return useAppMutation((input: HouseholdInput): Promise<HouseholdWithMembers> => api.households.create(input), {
    invalidates: [ queryKeys.storedHouseholds ],
  });
}

/** Colmeias kept in this browser. Empty against the Rails API, which knows none. */
export function useStoredHouseholds() {
  const api = useApi();
  const list = api.listStoredHouseholds;
  return useQuery({
    queryKey: queryKeys.storedHouseholds,
    queryFn: () => (list ? list.call(api) : Promise.resolve([])),
    enabled: list !== undefined,
  });
}

/**
 * Moving to another colmeia. A browser that already claimed someone there just
 * goes back in; anyone else has to say who they are first.
 */
export function useColmeiaSwitcher() {
  const { memberships, enter } = useSessionContext();
  const navigate = useNavigate();

  return useCallback((inviteCode: string) => {
    const memberId = memberships[inviteCode];
    if (memberId === undefined) {
      void navigate(`/entrar/${inviteCode}`);
      return;
    }
    enter({ inviteCode, memberId, seasonId: null });
    void navigate("/");
  }, [ memberships, enter, navigate ]);
}
