import { endOfDay, parseISO, startOfDay } from "date-fns";
import { fromIsoDate } from "../lib/dates";
import { completionsInSeason } from "./seasons";
import type { Completion, Goal, Season } from "./types";

export interface SeasonBounds {
  start: Date;
  /** Inclusive: the last moment that still counts for the estação. */
  end: Date;
}

export interface GoalProgress {
  earned: number;
  target: number;
  ratio: number;
  remaining: number;
  reached: boolean;
  bounds: SeasonBounds;
}

/** An estação runs from its first day to its last, or to right now while it has no end. */
export function seasonBounds(season: Season, now: Date): SeasonBounds {
  const start = startOfDay(fromIsoDate(season.startsOn));
  return { start, end: season.endsOn === null ? now : endOfDay(fromIsoDate(season.endsOn)) };
}

export function isWithin(iso: string, bounds: SeasonBounds): boolean {
  const moment = parseISO(iso);
  return moment >= bounds.start && moment <= bounds.end;
}

export function approvedCompletions(completions: Completion[]): Completion[] {
  return completions.filter((completion) => completion.status === "approved");
}

/** Household goals count everyone; personal goals count only their member. */
export function goalProgress(goal: Goal, completions: Completion[], season: Season, now: Date): GoalProgress {
  const counted = approvedCompletions(completionsInSeason(completions, goal.seasonId)).filter(
    (completion) => goal.memberId === null || completion.memberId === goal.memberId,
  );
  const earned = counted.reduce((sum, completion) => sum + completion.pointsAwarded, 0);
  const ratio = Math.min(earned / goal.targetPoints, 1);
  return {
    earned,
    target: goal.targetPoints,
    ratio,
    remaining: Math.max(goal.targetPoints - earned, 0),
    reached: earned >= goal.targetPoints,
    bounds: seasonBounds(season, now),
  };
}
