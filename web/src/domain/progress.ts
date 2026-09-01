import { addMonths, addWeeks, parseISO, startOfMonth, startOfWeek } from "date-fns";
import type { Completion, Goal, GoalPeriod } from "./types";

export interface PeriodBounds {
  start: Date;
  /** Exclusive. */
  end: Date;
}

export interface GoalProgress {
  earned: number;
  target: number;
  ratio: number;
  remaining: number;
  reached: boolean;
  bounds: PeriodBounds;
}

/** Weeks start on Monday, the way a Brazilian family counts them. */
export function periodBounds(period: GoalPeriod, now: Date): PeriodBounds {
  if (period === "month") {
    const start = startOfMonth(now);
    return { start, end: addMonths(start, 1) };
  }
  const start = startOfWeek(now, { weekStartsOn: 1 });
  return { start, end: addWeeks(start, 1) };
}

export function isWithin(iso: string, bounds: PeriodBounds): boolean {
  const moment = parseISO(iso);
  return moment >= bounds.start && moment < bounds.end;
}

export function approvedInPeriod(completions: Completion[], bounds: PeriodBounds): Completion[] {
  return completions.filter((completion) => completion.status === "approved" && isWithin(completion.completedAt, bounds));
}

export function goalProgress(goal: Goal, completions: Completion[], now: Date): GoalProgress {
  const bounds = periodBounds(goal.period, now);
  const earned = approvedInPeriod(completions, bounds).reduce((sum, completion) => sum + completion.pointsAwarded, 0);
  const ratio = Math.min(earned / goal.targetPoints, 1);
  return {
    earned,
    target: goal.targetPoints,
    ratio,
    remaining: Math.max(goal.targetPoints - earned, 0),
    reached: earned >= goal.targetPoints,
    bounds,
  };
}
