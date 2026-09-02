import type { Goal, Household } from "../domain/types";
import { DEMO_INVITE_CODE, normalizeState, type LocalState, type StoredMember, type StoredState } from "./localState";
import type { KeyValueStore } from "./storage";

export const HOUSEHOLD_INDEX_KEY = "colmeia.households.v4";
export const HOUSEHOLD_KEY_PREFIX = "colmeia.db.v4.";
const LEGACY_V3_INDEX_KEY = "colmeia.households.v3";
const LEGACY_V3_PREFIX = "colmeia.db.v3.";
const LEGACY_V2_KEY = "colmeia.db.v2";
const LEGACY_V1_KEY = "colmeia.db.v1";

export interface HouseholdEntry {
  name: string;
  createdAt: string;
}

export type HouseholdIndex = Record<string, HouseholdEntry>;

type LegacyMember = Omit<StoredMember, "claimedAt">;
type StoredGoal = StoredState["goals"][number];

/** v2 held one colmeia per browser, with no invite code and nobody to claim. */
interface LegacyV2State extends Omit<StoredState, "household" | "members"> {
  household: Omit<Household, "inviteCode">;
  members: LegacyMember[];
}

/** v1 held a single household goal instead of a list. */
interface LegacyV1State extends Omit<LegacyV2State, "goals"> {
  goal: Omit<StoredGoal, "memberId"> | null;
}

function storageKey(inviteCode: string): string {
  return `${HOUSEHOLD_KEY_PREFIX}${inviteCode}`;
}

function fromV1({ goal, ...rest }: LegacyV1State): LegacyV2State {
  return { ...rest, goals: goal ? [ { ...goal, memberId: null } as Goal ] : [] };
}

/** Whoever was already using the app is in it; only new colmeias start out
 *  with placeholders waiting to be claimed. */
function fromV2(state: LegacyV2State): StoredState {
  return {
    ...state,
    household: { ...state.household, inviteCode: DEMO_INVITE_CODE },
    members: state.members.map((member) => ({ ...member, claimedAt: member.createdAt })),
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

  /** Built on first use: colmeias written before estações carry over with a
   *  first estação holding what they already had, an older single-colmeia store
   *  becomes the demo colmeia, and a browser that never saw the app gets the
   *  demo family. */
  index(): HouseholdIndex {
    const raw = this.store.getItem(HOUSEHOLD_INDEX_KEY);
    if (raw !== null) return JSON.parse(raw) as HouseholdIndex;

    const carried = this.takeSeasonlessColmeias();
    if (carried !== null) return this.rewrite(carried);

    const state = normalizeState(this.takeLegacyState() ?? this.seed(), this.clock());
    state.household.inviteCode = DEMO_INVITE_CODE;
    return this.rewrite([ [ state, undefined ] ]);
  }

  read(inviteCode: string): LocalState | null {
    if (!(inviteCode in this.index())) return null;
    const raw = this.store.getItem(storageKey(inviteCode));
    return raw === null ? null : normalizeState(JSON.parse(raw) as StoredState, this.clock());
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

  private rewrite(colmeias: [ LocalState, string | undefined ][]): HouseholdIndex {
    colmeias.forEach(([ state ]) => this.writeState(state));
    const index = Object.fromEntries(
      colmeias.map(([ state, createdAt ]) => [ state.household.inviteCode, this.entry(state, createdAt) ]),
    );
    this.saveIndex(index);
    return index;
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

  /** The colmeias of a browser that stopped using the app before estações. */
  private takeSeasonlessColmeias(): [ LocalState, string | undefined ][] | null {
    const raw = this.store.getItem(LEGACY_V3_INDEX_KEY);
    if (raw === null) return null;

    const index = JSON.parse(raw) as HouseholdIndex;
    this.store.removeItem(LEGACY_V3_INDEX_KEY);
    return Object.entries(index).flatMap(([ inviteCode, entry ]) => {
      const stored = this.store.getItem(`${LEGACY_V3_PREFIX}${inviteCode}`);
      this.store.removeItem(`${LEGACY_V3_PREFIX}${inviteCode}`);
      if (stored === null) return [];
      const carried: [ LocalState, string | undefined ] = [
        normalizeState(JSON.parse(stored) as StoredState, this.clock()),
        entry.createdAt,
      ];
      return [ carried ];
    });
  }

  private takeLegacyState(): StoredState | null {
    const v2 = this.store.getItem(LEGACY_V2_KEY);
    const v1 = this.store.getItem(LEGACY_V1_KEY);
    this.store.removeItem(LEGACY_V2_KEY);
    this.store.removeItem(LEGACY_V1_KEY);
    if (v2 !== null) return fromV2(JSON.parse(v2) as LegacyV2State);
    if (v1 !== null) return fromV2(fromV1(JSON.parse(v1) as LegacyV1State));
    return null;
  }
}
