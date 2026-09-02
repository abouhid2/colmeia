import { DEFAULT_CROWN_TITLE } from "../domain/crownTitles";
import type {
  AchievementAward, Completion, Goal, Household, HouseholdWithMembers, Member, Season, ShoppingItem, Task,
} from "../domain/types";
import { toIsoDate } from "../lib/dates";

/** The colmeia older single-store data becomes, and the one earlier versions
 *  of this app seeded on first use. New sandboxes get a code of their own. */
export const DEMO_INVITE_CODE = "demo";

export const EXAMPLE_HOUSEHOLD_NAME = "Família de exemplo";
/** Whoever opens the example walks in as Ana: her place is claimed for her. */
export const EXAMPLE_ENTRY_MEMBER = "Ana";

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
  /** Badges already written down, so they outlive their completions. */
  awards: AchievementAward[];
  nextId: number;
}

export function emptyState(inviteCode: string, name: string, now: Date): LocalState {
  return {
    household: { id: 1, name, inviteCode, demo: false },
    members: [],
    seasons: [ firstSeason(2, toIsoDate(now), now) ],
    tasks: [],
    completions: [],
    shoppingItems: [],
    goals: [],
    awards: [],
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

/** A browser can hold a state written before crown titles, lagartinhas or estações existed. */
export type Older<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type StoredMember = Older<Member, "crownTitle" | "kind" | "pointsMultiplier" | "favoriteAchievements">;
/** Goals used to carry a weekly or monthly period instead of belonging to an estação. */
type StoredGoal = Older<Goal, "seasonId"> & { period?: string };

export type StoredState = Omit<
  LocalState, "household" | "members" | "seasons" | "tasks" | "completions" | "goals" | "awards"
> & {
  household: Older<Household, "demo">;
  members: StoredMember[];
  seasons?: StoredSeason[];
  tasks: Older<Task, "kidFriendly" | "seasonId">[];
  completions: Older<Completion, "multiplier" | "seasonId">[];
  goals: StoredGoal[];
  awards?: AchievementAward[];
};

/** Fills in every field an older store can be missing, on read, so nothing
 *  downstream has to wonder whether it is there. Everything written before
 *  estações existed belongs to the first one, which opens on the oldest day the
 *  colmeia has and never ends. */
export function normalizeState(state: StoredState, now: Date): LocalState {
  const seasons = state.seasons ?? [];
  const adopted = seasons.length > 0 ? seasons : [ firstSeason(state.nextId, firstDay(state, toIsoDate(now)), now) ];
  const [ first ] = adopted;
  return {
    ...state,
    // Anything stored before sandboxes existed is somebody's real colmeia.
    household: { ...state.household, demo: state.household.demo ?? false },
    seasons: adopted,
    nextId: seasons.length > 0 ? state.nextId : state.nextId + 1,
    members: state.members.map((member) => ({
      ...member,
      kind: member.kind ?? "bee",
      pointsMultiplier: member.pointsMultiplier ?? 1,
      crownTitle: member.crownTitle ?? DEFAULT_CROWN_TITLE,
      favoriteAchievements: member.favoriteAchievements ?? [],
    })),
    tasks: state.tasks.map((task) => ({ ...task, kidFriendly: task.kidFriendly ?? false, seasonId: task.seasonId ?? first.id })),
    completions: state.completions.map((completion) => ({
      ...completion,
      multiplier: completion.multiplier ?? 1,
      seasonId: completion.seasonId ?? first.id,
    })),
    goals: state.goals.map(({ period: _period, ...goal }) => ({ ...goal, seasonId: goal.seasonId ?? first.id })),
    awards: state.awards ?? [],
  };
}

/** The oldest day the colmeia has, so nothing predates its own first estação. */
function firstDay(state: StoredState, today: string): string {
  const days = [
    ...state.tasks.map((task) => task.createdAt),
    ...state.completions.map((completion) => completion.completedAt),
  ].map((moment) => moment.slice(0, 10));
  return days.reduce((earliest, day) => (day < earliest ? day : earliest), today);
}

export function withMembers(state: LocalState): HouseholdWithMembers {
  return { ...state.household, members: state.members };
}
