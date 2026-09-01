import { useCallback } from "react";
import { useSearchParams } from "react-router";
import type { Member } from "../domain/types";
import { useMembers } from "./useMembers";

export const MEMBER_FILTER_PARAM = "membro";

/** "Show me only Duda's things." Lives in the URL, so it survives navigation and can be shared. */
export function useMemberFilter() {
  const [params, setParams] = useSearchParams();
  const { members } = useMembers();
  const raw = params.get(MEMBER_FILTER_PARAM);
  const member: Member | null = raw === null ? null : (members.find((candidate) => candidate.id === Number(raw)) ?? null);

  const setMemberId = useCallback((id: number | null) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (id === null) next.delete(MEMBER_FILTER_PARAM);
      else next.set(MEMBER_FILTER_PARAM, String(id));
      return next;
    }, { replace: true });
  }, [setParams]);

  return { memberId: member?.id ?? null, member, setMemberId };
}
