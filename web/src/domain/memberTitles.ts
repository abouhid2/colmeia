import { seasonCrown } from "./crown";
import { isClosed, seasonsNewestFirst } from "./seasons";
import { crownTitle, votedTitlesIn, votesInSeason } from "./seasonTitles";
import { titleResults } from "./titleResults";
import type { Completion, Goal, Member, Season, SeasonTitle, SeasonTitleVote } from "./types";

export interface MemberTitleAward {
  season: Season;
  emoji: string;
  /** What they were called: their own crown title, or the name of the voted one. */
  label: string;
}

export interface MemberTitlesInput {
  memberId: number;
  seasons: Season[];
  titles: SeasonTitle[];
  votes: SeasonTitleVote[];
  members: Member[];
  completions: Completion[];
  goals: Goal[];
}

/**
 * Everything one person was called, estação by estação, newest first. Only a
 * closed estação has anything to say: while one runs, nothing is decided.
 */
export function memberTitles(
  { memberId, seasons, titles, votes, members, completions, goals }: MemberTitlesInput,
): MemberTitleAward[] {
  const crown = crownTitle(titles);

  return seasonsNewestFirst(seasons.filter(isClosed)).flatMap((season) => {
    const { winner } = seasonCrown(season, { members, completions, goals });
    const crowned = crown !== null && winner?.member.id === memberId
      ? [ { season, emoji: crown.emoji, label: winner.member.crownTitle } ]
      : [];

    const cast = votesInSeason(votes, season.id);
    const voted = titleResults(votedTitlesIn(titles, cast), cast, members)
      .filter((result) => result.winner?.id === memberId)
      .map((result) => ({ season, emoji: result.title.emoji, label: result.title.name }));

    return [ ...crowned, ...voted ];
  });
}
