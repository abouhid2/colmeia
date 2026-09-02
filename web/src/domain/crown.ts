import { wantsCrown } from "./crownTitles";
import { rankMembers } from "./leaderboard";
import { goalProgress, approvedCompletions } from "./progress";
import { completionsInSeason, lastClosedSeason } from "./seasons";
import type { Completion, Goal, Member, Season } from "./types";

/** An estação with no end never closes a window, so it sorts after every date. */
const NO_END = "9999-12-31";

export interface CrownInput {
  members: Member[];
  completions: Completion[];
  /** Every estação of the colmeia; the crown comes from the last one closed. */
  seasons: Season[];
  /** Every goal of the colmeia; only the closed estação's colmeia goal rules. */
  goals: Goal[];
  now: Date;
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
 * The meta da colmeia that decides an estação: the one whose window closes last,
 * which is the one covering the estação's own last day. Several ending together
 * hand it to the newest. An estação can hold many metas, but only the one still
 * standing at the end says whether the family won it.
 */
export function decidingGoal(goals: Goal[], season: Season): Goal | null {
  const ending = (goal: Goal) => goal.endsOn ?? season.endsOn ?? NO_END;
  return goals
    .filter((goal) => goal.seasonId === season.id && goal.memberIds.length === 0)
    .reduce<Goal | null>((latest, goal) => {
      if (latest === null) return goal;
      const [ mine, theirs ] = [ ending(goal), ending(latest) ];
      return mine > theirs || (mine === theirs && goal.id > latest.id) ? goal : latest;
    }, null);
}

/**
 * Who wears the crown, for winning the estação that closed last.
 *
 * The reward has to have been won: with a meta da colmeia deciding that estação,
 * the points inside that meta's window must have reached its target. Without a
 * meta there is nothing to reach, so the top scorer is crowned. Most points wins,
 * then most tasks; a dead heat crowns nobody. A winner who cleared their crown
 * title wanted no crown, and it dies with them rather than passing to second place.
 */
export function crownHolder({ members, completions, seasons, goals, now }: CrownInput): Crown | null {
  const wonIn = lastClosedSeason(seasons);
  return wonIn === null ? null : seasonCrown(wonIn, { members, completions, goals, now }).winner;
}

export interface SeasonCrown {
  /** Who won the estação, or null when nobody did. */
  winner: Crown | null;
  /** Whether the meta da colmeia that decides it was reached. null when it had none. */
  goalReached: boolean | null;
}

/** The same rule, told about one estação: who won it, and whether the meta da
 *  colmeia that gates the crown was reached at all. */
export function seasonCrown(season: Season, { members, completions, goals, now }: Omit<CrownInput, "seasons">): SeasonCrown {
  const scored = approvedCompletions(completionsInSeason(completions, season.id));
  const goal = decidingGoal(goals, season);
  const goalReached = goal === null ? null : goalProgress(goal, completions, season, now).reached;
  if (goalReached === false) return { winner: null, goalReached };

  const [ winner, runnerUp ] = rankMembers(members, scored);
  if (!winner || winner.points === 0) return { winner: null, goalReached };
  if (runnerUp && runnerUp.points === winner.points && runnerUp.tasksCount === winner.tasksCount) return { winner: null, goalReached };
  if (!wantsCrown(winner.member)) return { winner: null, goalReached };

  return { winner: { member: winner.member, points: winner.points, tasksCount: winner.tasksCount, wonIn: season }, goalReached };
}
