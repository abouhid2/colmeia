import { subMonths, subWeeks } from "date-fns";
import { wantsCrown } from "./crownTitles";
import { rankMembers } from "./leaderboard";
import { approvedInPeriod, periodBounds, type PeriodBounds } from "./progress";
import type { Completion, Goal, GoalPeriod, Member } from "./types";

export interface CrownInput {
  members: Member[];
  completions: Completion[];
  /** The household goal, if the family set one. Its period rules the crown. */
  goal: Goal | null;
  now: Date;
}

export interface Crown {
  member: Member;
  /** What the winner scored in the period they won. */
  points: number;
  tasksCount: number;
  period: GoalPeriod;
  /** The period that was won. */
  wonIn: PeriodBounds;
  /** How long the crown lasts: the whole current period. */
  wearsUntil: PeriodBounds;
}

/** The period right before the one `now` falls into. */
export function previousPeriodBounds(period: GoalPeriod, now: Date): PeriodBounds {
  const current = periodBounds(period, now);
  const start = period === "month" ? subMonths(current.start, 1) : subWeeks(current.start, 1);
  return { start, end: current.start };
}

/**
 * Who wears the crown this period, for winning the last one.
 *
 * The reward has to have been won: with a household goal, the family total in
 * the previous period must have reached the target. Without a goal there is
 * nothing to reach, so the top scorer is crowned. Most points wins, then most
 * tasks; a dead heat crowns nobody. A winner who cleared their crown title
 * wanted no crown, and it dies with them rather than passing to second place.
 */
export function crownHolder({ members, completions, goal, now }: CrownInput): Crown | null {
  const period = goal?.period ?? "week";
  const wonIn = previousPeriodBounds(period, now);
  const scored = approvedInPeriod(completions, wonIn);

  if (goal) {
    const householdPoints = scored.reduce((sum, completion) => sum + completion.pointsAwarded, 0);
    if (householdPoints < goal.targetPoints) return null;
  }

  const [winner, runnerUp] = rankMembers(members, scored);
  if (!winner || winner.points === 0) return null;
  if (runnerUp && runnerUp.points === winner.points && runnerUp.tasksCount === winner.tasksCount) return null;
  if (!wantsCrown(winner.member)) return null;

  return {
    member: winner.member,
    points: winner.points,
    tasksCount: winner.tasksCount,
    period,
    wonIn,
    wearsUntil: periodBounds(period, now),
  };
}
