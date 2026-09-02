import type { Completion, Member } from "./types";

export interface Standing {
  member: Member;
  points: number;
  tasksCount: number;
}

/** Ranks members by approved points. Pass completions already filtered to the period you care about. */
export function rankMembers(members: Member[], completions: Completion[]): Standing[] {
  const standings = members.map((member) => {
    const own = completions.filter((completion) => completion.memberId === member.id && completion.status === "approved");
    return {
      member,
      points: own.reduce((sum, completion) => sum + completion.pointsAwarded, 0),
      tasksCount: own.length,
    };
  });
  return standings.sort((left, right) => right.points - left.points || right.tasksCount - left.tasksCount);
}

/** The kids' own league, so a lagartinha can also come first somewhere. */
export function lagartinhaStandings(standings: Standing[]): Standing[] {
  return standings.filter((standing) => standing.member.kind === "lagartinha");
}
