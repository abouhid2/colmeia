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

export function withMembers(state: LocalState): HouseholdWithMembers {
  return { ...state.household, members: state.members };
}
