import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { Member, MemberInput } from "../domain/types";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useSessionContext } from "./useSessionContext";

const NOTHING = [] as const;

/**
 * Opening an invite link: look the colmeia up, take a place in it, and let the
 * browser remember which place that was.
 */
export function useInvite(inviteCode: string) {
  const api = useApi();
  const { enter, memberships } = useSessionContext();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: [ "invite", inviteCode ],
    queryFn: () => api.households.lookup(inviteCode),
    retry: false,
  });

  const bind = (memberId: number) => {
    enter({ inviteCode, memberId, seasonId: null });
    void navigate("/", { replace: true });
  };

  const claim = useAppMutation((memberId: number) => api.households.claim(inviteCode, memberId), {
    invalidates: NOTHING,
    onSuccess: (member: Member) => bind(member.id),
  });
  const join = useAppMutation((input: MemberInput) => api.households.join(inviteCode, input), {
    invalidates: NOTHING,
    onSuccess: (member: Member) => bind(member.id),
  });

  return {
    household: query.data,
    isLoading: query.isLoading,
    isMissing: query.isError,
    /** Set when this browser already took a place in this colmeia. */
    knownMemberId: memberships[inviteCode],
    resume: bind,
    claim,
    join,
  };
}
