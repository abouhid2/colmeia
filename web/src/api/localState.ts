import { DEFAULT_CROWN_TITLE } from "../domain/crownTitles";
import type {
  AchievementAward, Completion, Goal, Household, HouseholdWithMembers, Member, ShoppingItem, Task,
} from "../domain/types";

/** The colmeia older single-store data becomes, and the one earlier versions
 *  of this app seeded on first use. New sandboxes get a code of their own. */
export const DEMO_INVITE_CODE = "demo";

export const EXAMPLE_HOUSEHOLD_NAME = "Família de exemplo";
/** Whoever opens the example walks in as Ana: her place is claimed for her. */
export const EXAMPLE_ENTRY_MEMBER = "Ana";

export interface LocalState {
  household: Household;
  members: Member[];
  tasks: Task[];
  completions: Completion[];
  shoppingItems: ShoppingItem[];
  goals: Goal[];
  /** Badges already written down, so they outlive their completions. */
  awards: AchievementAward[];
  nextId: number;
}

export function emptyState(inviteCode: string, name: string): LocalState {
  return {
    household: { id: 1, name, inviteCode, demo: false },
    members: [],
    tasks: [],
    completions: [],
    shoppingItems: [],
    goals: [],
    awards: [],
    nextId: 2,
  };
}

/** A browser can hold a state written before crown titles or lagartinhas existed. */
export type Older<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type StoredMember = Older<Member, "crownTitle" | "kind" | "pointsMultiplier" | "favoriteAchievements">;

export type StoredState = Omit<LocalState, "household" | "members" | "tasks" | "completions" | "awards"> & {
  household: Older<Household, "demo">;
  members: StoredMember[];
  tasks: Older<Task, "kidFriendly">[];
  completions: Older<Completion, "multiplier">[];
  awards?: AchievementAward[];
};

/** Fills in every field an older store can be missing, on read, so nothing
 *  downstream has to wonder whether it is there. */
export function normalizeState(state: StoredState): LocalState {
  return {
    ...state,
    // Anything stored before sandboxes existed is somebody's real colmeia.
    household: { ...state.household, demo: state.household.demo ?? false },
    members: state.members.map((member) => ({
      ...member,
      kind: member.kind ?? "bee",
      pointsMultiplier: member.pointsMultiplier ?? 1,
      crownTitle: member.crownTitle ?? DEFAULT_CROWN_TITLE,
      favoriteAchievements: member.favoriteAchievements ?? [],
    })),
    tasks: state.tasks.map((task) => ({ ...task, kidFriendly: task.kidFriendly ?? false })),
    completions: state.completions.map((completion) => ({ ...completion, multiplier: completion.multiplier ?? 1 })),
    awards: state.awards ?? [],
  };
}

export function withMembers(state: LocalState): HouseholdWithMembers {
  return { ...state.household, members: state.members };
}
