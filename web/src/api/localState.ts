import type { Completion, Goal, Household, HouseholdWithMembers, Member, ShoppingItem, Task } from "../domain/types";

/** The colmeia the demo lives in, and the one older single-store data becomes. */
export const DEMO_INVITE_CODE = "demo";

export interface LocalState {
  household: Household;
  members: Member[];
  tasks: Task[];
  completions: Completion[];
  shoppingItems: ShoppingItem[];
  goals: Goal[];
  nextId: number;
}

export function emptyState(inviteCode: string, name: string): LocalState {
  return {
    household: { id: 1, name, inviteCode },
    members: [],
    tasks: [],
    completions: [],
    shoppingItems: [],
    goals: [],
    nextId: 2,
  };
}

/** Stores written before lagartinhas existed miss the new fields. Fill them in
 *  on read so nothing downstream has to wonder whether they are there. */
export function normalizeState(state: LocalState): LocalState {
  return {
    ...state,
    members: state.members.map((member) => ({ ...member, kind: member.kind ?? "bee", pointsMultiplier: member.pointsMultiplier ?? 1 })),
    tasks: state.tasks.map((task) => ({ ...task, kidFriendly: task.kidFriendly ?? false })),
    completions: state.completions.map((completion) => ({ ...completion, multiplier: completion.multiplier ?? 1 })),
  };
}

export function withMembers(state: LocalState): HouseholdWithMembers {
  return { ...state.household, members: state.members };
}
