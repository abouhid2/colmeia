import { rankMembers, type Standing } from "./leaderboard";
import {
  approvedCompletions, countsFor, goalProgress, isWithin, type GoalProgress, type SeasonBounds,
} from "./progress";
import { completionsInSeason } from "./seasons";
import type { Completion, Goal, Member, Season } from "./types";

/** Who a goal is for: nobody, one person, or a group of them. */
export type GoalAudience = "household" | "personal" | "group";

export interface GoalWithProgress {
  goal: Goal;
  progress: GoalProgress;
  /** The estação the goal belongs to, for the dates on its card. */
  season: Season;
  /** The people the goal is for. Empty means the whole colmeia. */
  members: Member[];
  /** Who contributed inside this goal's own estação. */
  standings: Standing[];
  /** What each person put into this goal, the biggest share first. */
  contributions: GoalContribution[];
}

/** One person's share of a goal, for the honeycomb and the chips under it. */
export interface GoalContribution {
  member: Member;
  points: number;
}

/** Who filled a goal: its own people, over its own window, counted exactly the
 *  way goalProgress counts, so the comb and the number under it agree. Points
 *  scored by somebody who has left the colmeia belong to nobody and are left
 *  out; the comb draws them as plain honey. */
export function goalContributions(goal: Goal, completions: Completion[], members: Member[], window: SeasonBounds): GoalContribution[] {
  const counted = approvedCompletions(completionsInSeason(completions, goal.seasonId)).filter(
    (completion) => countsFor(goal, completion.memberId) && isWithin(completion.completedAt, window),
  );
  const points = new Map<number, number>();
  counted.forEach((completion) => {
    if (completion.memberId === null) return;
    points.set(completion.memberId, (points.get(completion.memberId) ?? 0) + completion.pointsAwarded);
  });

  return members
    .map((member) => ({ member, points: points.get(member.id) ?? 0 }))
    .filter((entry) => entry.points > 0)
    .sort((left, right) => right.points - left.points || left.member.name.localeCompare(right.member.name));
}

export function goalAudience(goal: Goal): GoalAudience {
  if (goal.memberIds.length === 0) return "household";
  return goal.memberIds.length === 1 ? "personal" : "group";
}

export function participantsOf(goal: Goal, members: Member[]): Member[] {
  return members.filter((member) => goal.memberIds.includes(member.id));
}

/** Everything a screen needs to talk about the goals of one estação. */
export function goalsWithProgress(
  goals: Goal[], completions: Completion[], members: Member[], season: Season, now: Date,
): GoalWithProgress[] {
  const standings = rankMembers(members, completionsInSeason(completions, season.id));
  return goals
    .filter((goal) => goal.seasonId === season.id)
    .map((goal) => {
      const progress = goalProgress(goal, completions, season, now);
      return {
        goal,
        progress,
        season,
        members: participantsOf(goal, members),
        standings,
        contributions: goalContributions(goal, completions, members, progress.window),
      };
    });
}

/** Earliest window first, so a roteiro and a list read the same way. */
export function byWindowStart(items: GoalWithProgress[]): GoalWithProgress[] {
  return [...items].sort(
    (left, right) => left.progress.window.start.getTime() - right.progress.window.start.getTime() || left.goal.id - right.goal.id,
  );
}

export function householdGoals(items: GoalWithProgress[]): GoalWithProgress[] {
  return items.filter((item) => goalAudience(item.goal) === "household");
}

/** Goals somebody is named in: one person's, or a group's. */
export function goalsWithPeople(items: GoalWithProgress[]): GoalWithProgress[] {
  return items.filter((item) => goalAudience(item.goal) !== "household");
}

/** The goals one person is in, or all of them when nobody is filtered. */
export function goalsOf(items: GoalWithProgress[], memberId: number | null): GoalWithProgress[] {
  return memberId === null ? items : items.filter((item) => item.goal.memberIds.includes(memberId));
}

/** The one running today. Several at once means the one closing first. */
export function runningGoal(items: GoalWithProgress[], now: Date): GoalWithProgress | null {
  const running = items.filter((item) => now >= item.progress.window.start && now <= item.progress.window.end);
  return earliest(running, (item) => item.progress.window.end);
}

/** The next one to open, for the card that says how long the wait is. */
export function upcomingGoal(items: GoalWithProgress[], now: Date): GoalWithProgress | null {
  return earliest(items.filter((item) => now < item.progress.window.start), (item) => item.progress.window.start);
}

/** The last one to have run, so a finished estação still says how it ended. */
export function finishedGoal(items: GoalWithProgress[], now: Date): GoalWithProgress | null {
  const done = items.filter((item) => now > item.progress.window.end);
  return done.reduce<GoalWithProgress | null>(
    (latest, item) => (latest === null || item.progress.window.end > latest.progress.window.end ? item : latest),
    null,
  );
}

function earliest(items: GoalWithProgress[], day: (item: GoalWithProgress) => Date): GoalWithProgress | null {
  return items.reduce<GoalWithProgress | null>((best, item) => (best === null || day(item) < day(best) ? item : best), null);
}
