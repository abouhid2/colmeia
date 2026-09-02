import { addDays, endOfDay, startOfDay } from "date-fns";
import { fromIsoDate } from "../lib/dates";
import type { SeasonBounds } from "./progress";
import { frozenAt } from "./seasons";
import type { Season } from "./types";

/** How far ahead the roteiro of an estação with no end still draws. */
export const OPEN_SEASON_DAYS = 30;

/** The narrowest a bar may get, so a one-day meta is still something to aim at. */
const MIN_WIDTH = 0.03;

export interface RoadmapSpan extends SeasonBounds {
  /** The estação has no end: the roteiro draws a month ahead and says so. */
  openEnded: boolean;
}

export interface RoadmapBar {
  /** Percentages of the roteiro's width, ready for a style attribute. */
  left: number;
  width: number;
}

/**
 * The stretch of days a roteiro covers: up to the day a closed estação was frozen,
 * up to the last day of one that has an end, or a month ahead of today.
 */
export function roadmapSpan(season: Season, now: Date): RoadmapSpan {
  const start = startOfDay(fromIsoDate(season.startsOn));
  const frozen = frozenAt(season);
  if (frozen !== null) return { start, end: frozen, openEnded: false };
  if (season.endsOn !== null) return { start, end: endOfDay(fromIsoDate(season.endsOn)), openEnded: false };
  return { start, end: endOfDay(addDays(now, OPEN_SEASON_DAYS)), openEnded: true };
}

/** Where a window sits on the roteiro, clamped to it and never invisible. */
export function roadmapBar(window: SeasonBounds, span: RoadmapSpan): RoadmapBar {
  const from = ratio(window.start, span);
  const width = Math.max(ratio(window.end, span) - from, MIN_WIDTH);
  return { left: Math.min(from, 1 - width) * 100, width: width * 100 };
}

/** Where today falls on the roteiro, or null when it is not on it at all. */
export function roadmapMarker(now: Date, span: RoadmapSpan): number | null {
  if (now < span.start || now > span.end) return null;
  return ratio(now, span) * 100;
}

function ratio(moment: Date, span: RoadmapSpan): number {
  const total = span.end.getTime() - span.start.getTime();
  if (total <= 0) return 0;
  return clamp((moment.getTime() - span.start.getTime()) / total);
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
