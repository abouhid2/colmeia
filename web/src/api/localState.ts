import { toIsoDate } from "../lib/dates";
import type { Completion, Goal, Household, HouseholdWithMembers, Member, Season, ShoppingItem, Task } from "../domain/types";

/** The colmeia the demo lives in, and the one older single-store data becomes. */
export const DEMO_INVITE_CODE = "demo";

/** What a colmeia with no history opens with, so a task has somewhere to go. */
export const FIRST_SEASON_NAME = "Primeira estação";

/** Counts are read off the records, so the store never holds a stale one. */
export type StoredSeason = Omit<Season, "tasksCount" | "completionsCount">;

export interface LocalState {
  household: Household;
  members: Member[];
  seasons: StoredSeason[];
  tasks: Task[];
  completions: Completion[];
  shoppingItems: ShoppingItem[];
  goals: Goal[];
  nextId: number;
}

export function emptyState(inviteCode: string, name: string, now: Date): LocalState {
  return {
    household: { id: 1, name, inviteCode },
    members: [],
    seasons: [ firstSeason(2, toIsoDate(now), now) ],
    tasks: [],
    completions: [],
    shoppingItems: [],
    goals: [],
    nextId: 3,
  };
}

export function firstSeason(id: number, startsOn: string, now: Date): StoredSeason {
  return { id, name: FIRST_SEASON_NAME, startsOn, endsOn: null, closedAt: null, createdAt: now.toISOString() };
}

/** What the counts in the serializer are: read off the records that point at it. */
export function withCounts(state: LocalState, season: StoredSeason): Season {
  return {
    ...season,
    tasksCount: state.tasks.filter((task) => task.seasonId === season.id).length,
    completionsCount: state.completions.filter((completion) => completion.seasonId === season.id).length,
  };
}

export function withMembers(state: LocalState): HouseholdWithMembers {
  return { ...state.household, members: state.members };
}
