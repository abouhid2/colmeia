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
  return wonIn === null ? null : seasonCrown(wonIn, { members, completions, goals }).winner;
}

export interface SeasonCrown {
  /** Who won the estação, or null when nobody did. */
  winner: Crown | null;
  /** Whether the colmeia goal was reached. null when the estação had none. */
  goalReached: boolean | null;
}

/** The same rule, told about one estação: who won it, and whether the colmeia
 *  goal that gates the crown was reached at all. */
export function seasonCrown(season: Season, { members, completions, goals }: Omit<CrownInput, "seasons">): SeasonCrown {
  const scored = approvedCompletions(completionsInSeason(completions, season.id));
  const goal = goals.find((candidate) => candidate.seasonId === season.id && candidate.memberId === null) ?? null;
  const earned = scored.reduce((sum, completion) => sum + completion.pointsAwarded, 0);
  const goalReached = goal === null ? null : earned >= goal.targetPoints;
  if (goalReached === false) return { winner: null, goalReached };

  const [winner, runnerUp] = rankMembers(members, scored);
  if (!winner || winner.points === 0) return { winner: null, goalReached };
  if (runnerUp && runnerUp.points === winner.points && runnerUp.tasksCount === winner.tasksCount) return { winner: null, goalReached };
  if (!wantsCrown(winner.member)) return { winner: null, goalReached };

  return { winner: { member: winner.member, points: winner.points, tasksCount: winner.tasksCount, wonIn: season }, goalReached };
}
