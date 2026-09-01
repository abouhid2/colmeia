import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useMembers } from "../../hooks/useMembers";
import { SessionContext } from "../../hooks/useSession";

const STORAGE_KEY = "colmeia.currentMemberId";

function readStoredId(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { members, isLoading } = useMembers();
  const [storedId, setStoredId] = useState<number | null>(readStoredId);

  const currentMember = useMemo(
    () => members.find((member) => member.id === storedId) ?? members[0] ?? null,
    [members, storedId],
  );

  const setCurrentMemberId = useCallback((id: number) => {
    setStoredId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // Private mode or blocked storage: the choice just will not survive a reload.
    }
  }, []);

  const value = useMemo(
    () => ({ currentMember, members, isLoading, setCurrentMemberId }),
    [currentMember, members, isLoading, setCurrentMemberId],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
