import { wantsCrown } from "./crownTitles";
import { rankMembers } from "./leaderboard";
import { approvedCompletions } from "./progress";
import { completionsInSeason, lastClosedSeason } from "./seasons";
import type { Completion, Goal, Member, Season } from "./types";

export interface CrownInput {
  members: Member[];
  completions: Completion[];
  /** Every estação of the colmeia; the crown comes from the last one closed. */
  seasons: Season[];
  /** Every goal of the colmeia; only the closed estação's household goal rules. */
  goals: Goal[];
}

export interface Crown {
  member: Member;
  /** What the winner scored in the estação they won. */
  points: number;
  tasksCount: number;
  /** The estação that was won. */
  wonIn: Season;
}

/**
 * Who wears the crown, for winning the estação that closed last.
 *
 * The reward has to have been won: with a household goal in that estação, the
 * family total must have reached the target. Without a goal there is nothing to
 * reach, so the top scorer is crowned. Most points wins, then most tasks; a dead
 * heat crowns nobody. A winner who cleared their crown title wanted no crown,
 * and it dies with them rather than passing to second place.
 */
export function crownHolder({ members, completions, seasons, goals }: CrownInput): Crown | null {
  const wonIn = lastClosedSeason(seasons);
  if (wonIn === null) return null;

  const scored = approvedCompletions(completionsInSeason(completions, wonIn.id));
  const goal = goals.find((candidate) => candidate.seasonId === wonIn.id && candidate.memberId === null) ?? null;

  if (goal) {
    const householdPoints = scored.reduce((sum, completion) => sum + completion.pointsAwarded, 0);
    if (householdPoints < goal.targetPoints) return null;
  }

  const [winner, runnerUp] = rankMembers(members, scored);
  if (!winner || winner.points === 0) return null;
  if (runnerUp && runnerUp.points === winner.points && runnerUp.tasksCount === winner.tasksCount) return null;
  if (!wantsCrown(winner.member)) return null;

  return { member: winner.member, points: winner.points, tasksCount: winner.tasksCount, wonIn };
}
