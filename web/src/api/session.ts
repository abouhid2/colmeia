import type { KeyValueStore } from "./storage";

/** Which colmeia this browser is in, who it is inside it, and which estação it is looking at. */
export interface Session {
  inviteCode: string;
  memberId: number;
  /** null until an estação is picked, or when the stored one is gone. */
  seasonId: number | null;
}

export const SESSION_KEY = "colmeia.session";
/** Who this browser is in each colmeia it has entered, so switching back works. */
export const MEMBERSHIPS_KEY = "colmeia.memberships";
const LEGACY_MEMBER_KEY = "colmeia.currentMemberId";
const LEGACY_INVITE_CODE = "demo";

export type Memberships = Record<string, number>;

function parse<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readSession(store: KeyValueStore): Session | null {
  const stored = parse<Partial<Session>>(store.getItem(SESSION_KEY));
  if (typeof stored?.inviteCode === "string" && typeof stored.memberId === "number") {
    // A session written before estações existed simply has no estação yet.
    return { inviteCode: stored.inviteCode, memberId: stored.memberId, seasonId: stored.seasonId ?? null };
  }
  return readLegacySession(store);
}

/** Before colmeias, a browser only remembered which member it was. */
function readLegacySession(store: KeyValueStore): Session | null {
  const raw = store.getItem(LEGACY_MEMBER_KEY);
  store.removeItem(LEGACY_MEMBER_KEY);
  const memberId = raw === null ? Number.NaN : Number(raw);
  if (!Number.isFinite(memberId)) return null;
  const session: Session = { inviteCode: LEGACY_INVITE_CODE, memberId, seasonId: null };
  writeSession(store, session);
  return session;
}

export function writeSession(store: KeyValueStore, session: Session): void {
  store.setItem(SESSION_KEY, JSON.stringify(session));
  store.setItem(MEMBERSHIPS_KEY, JSON.stringify({ ...readMemberships(store), [session.inviteCode]: session.memberId }));
}

export function clearSession(store: KeyValueStore): void {
  store.removeItem(SESSION_KEY);
}

export function readMemberships(store: KeyValueStore): Memberships {
  const stored = parse<Memberships>(store.getItem(MEMBERSHIPS_KEY));
  return stored === null || typeof stored !== "object" ? {} : stored;
}
