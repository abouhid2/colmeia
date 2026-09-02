import { createContext, useContext } from "react";
import type { Memberships, Session } from "../api/session";

export interface SessionContextValue {
  /** Which colmeia this browser is in, and who it is inside it. */
  session: Session | null;
  /** Who this browser already is in each colmeia it has entered. */
  memberships: Memberships;
  /** Bind the browser to a colmeia after claiming a place in it. */
  enter(session: Session): void;
  leave(): void;
  /** The shared kitchen tablet: same colmeia, another person. */
  setCurrentMemberId(id: number): void;
  /** Which estação this browser is looking at inside the colmeia. */
  setCurrentSeasonId(id: number): void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSessionContext must be used inside AppProviders");
  return context;
}
