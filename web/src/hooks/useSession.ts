import { createContext, useContext } from "react";
import type { Member } from "../domain/types";

export interface SessionContextValue {
  /** Who is using the app right now. Picked in the header, remembered per browser. */
  currentMember: Member | null;
  members: Member[];
  isLoading: boolean;
  setCurrentMemberId(id: number): void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside AppProviders");
  return context;
}
