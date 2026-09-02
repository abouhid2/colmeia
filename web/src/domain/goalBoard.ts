import { rankMembers, type Standing } from "./leaderboard";
import { goalProgress, type GoalProgress, type GoalStatus } from "./progress";
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
    .map((goal) => ({
      goal,
      progress: goalProgress(goal, completions, season, now),
      season,
      members: participantsOf(goal, members),
      standings,
    }));
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

/** What filtering by one person leaves: their own goals, and the colmeia's,
 *  which are theirs too. */
export function goalsSeenBy(items: GoalWithProgress[], memberId: number | null): GoalWithProgress[] {
  if (memberId === null) return items;
  return items.filter((item) => item.goal.memberIds.length === 0 || item.goal.memberIds.includes(memberId));
}

/** A window already behind us: whatever the goal did, it is done doing it. */
export function isOver(item: GoalWithProgress, now: Date): boolean {
  return now > item.progress.window.end;
}

/** "Todas", or one situation a goal can be in. */
export type GoalStatusFilter = "all" | GoalStatus;

export function byStatus(items: GoalWithProgress[], filter: GoalStatusFilter): GoalWithProgress[] {
  return filter === "all" ? items : items.filter((item) => item.progress.status === filter);
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
