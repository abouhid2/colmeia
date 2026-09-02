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
  if (wonIn === null) return null;

  const scored = approvedCompletions(completionsInSeason(completions, wonIn.id));
  const goal = decidingGoal(goals, wonIn);
  if (goal && !goalProgress(goal, completions, wonIn, now).reached) return null;

  const [ winner, runnerUp ] = rankMembers(members, scored);
  if (!winner || winner.points === 0) return null;
  if (runnerUp && runnerUp.points === winner.points && runnerUp.tasksCount === winner.tasksCount) return null;
  if (!wantsCrown(winner.member)) return null;

  return { member: winner.member, points: winner.points, tasksCount: winner.tasksCount, wonIn };
}
