import type { Goal, Household, Member } from "../domain/types";
import { DEMO_INVITE_CODE, type LocalState } from "./localState";
import { parseJson, type KeyValueStore } from "./storage";

export const HOUSEHOLD_INDEX_KEY = "colmeia.households.v3";
export const HOUSEHOLD_KEY_PREFIX = "colmeia.db.v3.";
const LEGACY_V2_KEY = "colmeia.db.v2";
const LEGACY_V1_KEY = "colmeia.db.v1";

export interface HouseholdEntry {
  name: string;
  createdAt: string;
}

export type HouseholdIndex = Record<string, HouseholdEntry>;

type LegacyMember = Omit<Member, "claimedAt">;

/** v2 held one colmeia per browser, with no invite code and nobody to claim. */
interface LegacyV2State extends Omit<LocalState, "household" | "members"> {
  household: Omit<Household, "inviteCode">;
  members: LegacyMember[];
}

/** v1 held a single household goal instead of a list. */
interface LegacyV1State extends Omit<LegacyV2State, "goals"> {
  goal: Omit<Goal, "memberId"> | null;
}

function storageKey(inviteCode: string): string {
  return `${HOUSEHOLD_KEY_PREFIX}${inviteCode}`;
}

function fromV1({ goal, ...rest }: LegacyV1State): LegacyV2State {
  return { ...rest, goals: goal ? [ { ...goal, memberId: null } ] : [] };
}

/** v2 had no notion of who this browser was, so everybody stays a placeholder:
 *  whoever opens the app says which of these people they are, once. */
function fromV2(state: LegacyV2State): LocalState {
  return {
    ...state,
    household: { ...state.household, inviteCode: DEMO_INVITE_CODE },
    members: state.members.map((member) => ({ ...member, claimedAt: null })),
  };
}

/** Many colmeias in one browser: an index to list them, one key each to hold them. */
export class LocalStore {
  private readonly store: KeyValueStore;
  private readonly seed: () => LocalState;
  private readonly clock: () => Date;

  constructor(store: KeyValueStore, seed: () => LocalState, clock: () => Date) {
    this.store = store;
    this.seed = seed;
    this.clock = clock;
  }

  /** Built on first use: an older single-colmeia store becomes the demo
   *  colmeia, and a browser that never saw the app gets the demo family. */
  index(): HouseholdIndex {
    const stored = parseJson<HouseholdIndex>(this.store.getItem(HOUSEHOLD_INDEX_KEY));
    if (stored !== null && typeof stored === "object") return stored;

    const state = this.takeLegacyState() ?? this.seed();
    state.household.inviteCode = DEMO_INVITE_CODE;
    this.writeState(state);
    const index: HouseholdIndex = { [DEMO_INVITE_CODE]: this.entry(state) };
    this.saveIndex(index);
    return index;
  }

  read(inviteCode: string): LocalState | null {
    const stored = this.resolve(inviteCode);
    return stored === null ? null : parseJson<LocalState>(this.store.getItem(storageKey(stored)));
  }

  /** The code as this browser filed it, whatever case it was typed in. */
  resolve(inviteCode: string): string | null {
    const index = this.index();
    if (inviteCode in index) return inviteCode;
    const wanted = inviteCode.toLowerCase();
    return Object.keys(index).find((code) => code.toLowerCase() === wanted) ?? null;
  }

  save(state: LocalState): void {
    const index = this.index();
    this.writeState(state);
    const inviteCode = state.household.inviteCode;
    this.saveIndex({ ...index, [inviteCode]: this.entry(state, index[inviteCode]?.createdAt) });
  }

  /** "Restaurar exemplo": the demo colmeia goes back to its seed. */
  resetDemo(): LocalState {
    const state = this.seed();
    state.household.inviteCode = DEMO_INVITE_CODE;
    this.save(state);
    return state;
  }

  private entry(state: LocalState, createdAt?: string): HouseholdEntry {
    return { name: state.household.name, createdAt: createdAt ?? this.clock().toISOString() };
  }

  private writeState(state: LocalState): void {
    this.store.setItem(storageKey(state.household.inviteCode), JSON.stringify(state));
  }

  private saveIndex(index: HouseholdIndex): void {
    this.store.setItem(HOUSEHOLD_INDEX_KEY, JSON.stringify(index));
  }

  private takeLegacyState(): LocalState | null {
    const v2 = parseJson<LegacyV2State>(this.store.getItem(LEGACY_V2_KEY));
    const v1 = parseJson<LegacyV1State>(this.store.getItem(LEGACY_V1_KEY));
    this.store.removeItem(LEGACY_V2_KEY);
    this.store.removeItem(LEGACY_V1_KEY);
    if (v2 !== null) return fromV2(v2);
    if (v1 !== null) return fromV2(fromV1(v1));
    return null;
  }
}
