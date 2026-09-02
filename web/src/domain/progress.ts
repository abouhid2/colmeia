import { endOfDay, parseISO, startOfDay } from "date-fns";
import { fromIsoDate } from "../lib/dates";
import { completionsInSeason, frozenAt } from "./seasons";
import type { Completion, Goal, Season } from "./types";

export interface SeasonBounds {
  start: Date;
  /** Inclusive: the last moment that still counts. */
  end: Date;
}

/**
 * Where a goal stands in time: waiting to start, running, already reached, or
 * over without the points. Reaching it wins over everything else, so a goal
 * whose last day has passed with the target met still reads as batida.
 */
export type GoalStatus = "upcoming" | "active" | "reached" | "missed";

export interface GoalProgress {
  earned: number;
  target: number;
  ratio: number;
  remaining: number;
  reached: boolean;
  status: GoalStatus;
  /** The days this goal counts, which may be a slice of its estação. */
  window: SeasonBounds;
}

/**
 * An estação runs from its first day to the day it was closed, and to right now
 * while nobody has closed it: a planned last day that came and went does not stop
 * an estação that is still taking tasks.
 */
export function seasonBounds(season: Season, now: Date): SeasonBounds {
  const start = startOfDay(fromIsoDate(season.startsOn));
  const frozen = frozenAt(season);
  if (frozen !== null) return { start, end: frozen };
  const planned = season.endsOn === null ? null : endOfDay(fromIsoDate(season.endsOn));
  return { start, end: planned !== null && planned > now ? planned : now };
}

/** A goal runs for its own stretch of days, or for the whole estação when it has none. */
export function goalWindow(goal: Goal, season: Season, now: Date): SeasonBounds {
  const bounds = seasonBounds(season, now);
  return {
    start: goal.startsOn === null ? bounds.start : startOfDay(fromIsoDate(goal.startsOn)),
    end: goal.endsOn === null ? bounds.end : endOfDay(fromIsoDate(goal.endsOn)),
  };
}

export function isWithin(iso: string, bounds: SeasonBounds): boolean {
  const moment = parseISO(iso);
  return moment >= bounds.start && moment <= bounds.end;
}

export function approvedCompletions(completions: Completion[]): Completion[] {
  return completions.filter((completion) => completion.status === "approved");
}

export function goalStatus(reached: boolean, window: SeasonBounds, now: Date): GoalStatus {
  if (reached) return "reached";
  if (now < window.start) return "upcoming";
  return now > window.end ? "missed" : "active";
}

/** Whether someone's points count towards a goal: everyone's do when nobody is named. */
export function countsFor(goal: Goal, memberId: number | null): boolean {
  if (goal.memberIds.length === 0) return true;
  return memberId !== null && goal.memberIds.includes(memberId);
}

/** Approved points scored inside the goal's window by the people it is for. */
export function goalProgress(goal: Goal, completions: Completion[], season: Season, now: Date): GoalProgress {
  const window = goalWindow(goal, season, now);
  const counted = approvedCompletions(completionsInSeason(completions, goal.seasonId)).filter(
    (completion) => countsFor(goal, completion.memberId) && isWithin(completion.completedAt, window),
  );
  const earned = counted.reduce((sum, completion) => sum + completion.pointsAwarded, 0);
  const reached = earned >= goal.targetPoints;
  return {
    earned,
    target: goal.targetPoints,
    ratio: Math.min(earned / goal.targetPoints, 1),
    remaining: Math.max(goal.targetPoints - earned, 0),
    reached,
    status: goalStatus(reached, window, now),
    window,
  };
}
