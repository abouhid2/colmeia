import type { Member, SeasonTitle, SeasonTitleVote } from "./types";

export interface TitleTally {
  member: Member;
  votes: number;
}

export interface TitleResult {
  title: SeasonTitle;
  /** Who got votes, most first. Nobody with zero shows up. */
  tallies: TitleTally[];
  /** Whoever the estação called this. Null while nobody voted, and null on a draw. */
  winner: Member | null;
  /** Two or more people at the top: the title goes to nobody. */
  tie: boolean;
  totalVotes: number;
}

/**
 * Who the colmeia called what, counted from the votes of one estação. Most
 * votes takes the title; a draw at the top leaves it with nobody, which is the
 * honest answer and keeps the family arguing about the right thing.
 */
export function titleResults(titles: SeasonTitle[], votes: SeasonTitleVote[], members: Member[]): TitleResult[] {
  return titles.map((title) => {
    const own = votes.filter((vote) => vote.seasonTitleId === title.id);
    const tallies = members
      .map((member) => ({ member, votes: own.filter((vote) => vote.voteeId === member.id).length }))
      .filter((tally) => tally.votes > 0)
      .sort((left, right) => right.votes - left.votes || left.member.id - right.member.id);
    const leaders = leadersOf(tallies);
    return {
      title,
      tallies,
      winner: leaders.length === 1 ? leaders[0].member : null,
      tie: leaders.length > 1,
      totalVotes: own.length,
    };
  });
}

/** Everyone level at the top of a tally. */
export function leadersOf(tallies: TitleTally[]): TitleTally[] {
  const top = tallies[0]?.votes ?? 0;
  return top === 0 ? [] : tallies.filter((tally) => tally.votes === top);
}
