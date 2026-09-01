import type { Completion, Goal, Household, Member, ShoppingItem, Task } from "../domain/types";

export interface LocalState {
  household: Household;
  members: Member[];
  tasks: Task[];
  completions: Completion[];
  shoppingItems: ShoppingItem[];
  goals: Goal[];
  nextId: number;
}

export function emptyState(): LocalState {
  return {
    household: { id: 1, name: "Nossa casa" },
    members: [],
    tasks: [],
    completions: [],
    shoppingItems: [],
    goals: [],
    nextId: 2,
  };
}
