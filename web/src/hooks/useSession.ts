import { useMemo } from "react";
import type { Member } from "../domain/types";
import { useMembers } from "./useMembers";
import { useSessionContext, type SessionContextValue } from "./useSessionContext";

export interface SessionValue extends SessionContextValue {
  /** Who is using the app right now, inside the colmeia of the session. */
  currentMember: Member | null;
  members: Member[];
  isLoading: boolean;
}

export function useSession(): SessionValue {
  const context = useSessionContext();
  const { members, isLoading } = useMembers();
  const memberId = context.session?.memberId;

  const currentMember = useMemo(
    () => members.find((member) => member.id === memberId) ?? members[0] ?? null,
    [ members, memberId ],
  );

  return { ...context, currentMember, members, isLoading };
}
