import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { clearSession, readMemberships, readSession, writeSession, type Session } from "../../api/session";
import { browserStore } from "../../api/storage";
import { useApi } from "../../hooks/useApi";
import { SessionContext } from "../../hooks/useSessionContext";

const store = browserStore();

/**
 * Binds this browser to one colmeia and one person inside it. Changing the
 * person is a local switch; changing the colmeia drops the cache, because none
 * of it belongs to the new one.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [ session, setSession ] = useState<Session | null>(() => readSession(store));
  const [ memberships, setMemberships ] = useState(() => readMemberships(store));

  const apply = useCallback((next: Session | null) => {
    const changedColmeia = (next?.inviteCode ?? null) !== (session?.inviteCode ?? null);
    api.setInviteCode(next?.inviteCode ?? null);
    if (next === null) clearSession(store);
    else writeSession(store, next);
    setSession(next);
    setMemberships(readMemberships(store));
    if (changedColmeia) queryClient.clear();
  }, [ api, queryClient, session ]);

  const setCurrentMemberId = useCallback((memberId: number) => {
    if (session === null) return;
    const next = { ...session, memberId };
    writeSession(store, next);
    setSession(next);
    setMemberships(readMemberships(store));
  }, [session]);

  const value = useMemo(
    () => ({ session, memberships, enter: apply, leave: () => apply(null), setCurrentMemberId }),
    [ session, memberships, apply, setCurrentMemberId ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
