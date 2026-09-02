import { parseISO } from "date-fns";
import { toIsoDate } from "../lib/dates";
import type { Completion, Season } from "./types";

export function isClosed(season: Season): boolean {
  return season.closedAt !== null;
}

/**
 * The moment an estação stopped counting, or null while it is still running.
 * The ranking freezes the day it was closed, whatever its planned last day said.
 */
export function frozenAt(season: Season): Date | null {
  return season.closedAt === null ? null : parseISO(season.closedAt);
}

/** Whether an ISO day falls inside the estação, an open end included. */
export function seasonCoversDay(season: Pick<Season, "startsOn" | "endsOn">, day: string): boolean {
  return season.startsOn <= day && (season.endsOn === null || day <= season.endsOn);
}

/** Whether a day falls inside the estação, an open end included. */
export function seasonContains(season: Season, date: Date): boolean {
  return seasonCoversDay(season, toIsoDate(date));
}

/** What was scored inside one estação. Completions carry theirs, so this never drifts. */
export function completionsInSeason(completions: Completion[], seasonId: number | null): Completion[] {
  return seasonId === null ? [] : completions.filter((completion) => completion.seasonId === seasonId);
}

export function seasonsNewestFirst(seasons: Season[]): Season[] {
  return [...seasons].sort((left, right) => right.startsOn.localeCompare(left.startsOn) || right.id - left.id);
}

/** The estação that closed last: its ranking is the one the crown comes from. */
export function lastClosedSeason(seasons: Season[]): Season | null {
  const closed = seasons.filter((season): season is Season & { closedAt: string } => season.closedAt !== null);
  const latest = closed.sort((left, right) => right.closedAt.localeCompare(left.closedAt))[0];
  return latest ?? null;
}

/**
 * Which estação the app opens on: the running one that covers today, then the
 * one that started most recently, and only then something already closed.
 */
export function defaultSeason(seasons: Season[], now: Date): Season | null {
  const ordered = seasonsNewestFirst(seasons);
  const running = ordered.filter((season) => !isClosed(season));
  return running.find((season) => seasonContains(season, now)) ?? running[0] ?? ordered[0] ?? null;
}

/** The stored choice while it still exists, the default otherwise. */
export function resolveSeason(seasons: Season[], seasonId: number | null, now: Date): Season | null {
  return seasons.find((season) => season.id === seasonId) ?? defaultSeason(seasons, now);
}
