import type { SeasonTitle, SeasonTitleKind, SeasonTitleVote } from "./types";

export const AUTO_TITLE: SeasonTitleKind = "auto";
export const VOTE_TITLE: SeasonTitleKind = "vote";

type SeasonTitleSeed = Pick<SeasonTitle, "name" | "description" | "emoji" | "kind">;

/**
 * What every colmeia opens with, the same list the Rails side seeds. The first
 * one is the crown the ranking already awards; the others are the ones the
 * family votes on once an estação closes.
 */
export const DEFAULT_SEASON_TITLES: SeasonTitleSeed[] = [
  {
    name: "Vencedor da estação", emoji: "👑", kind: AUTO_TITLE,
    description: "Quem mais pontuou com a meta da colmeia batida. Cada pessoa escolhe como quer ser chamada ao vencer.",
  },
  { name: "Pernilongo", emoji: "🦟", kind: VOTE_TITLE, description: "Só perturbou e não fez nada." },
  { name: "Abelhudo", emoji: "🔍", kind: VOTE_TITLE, description: "Ficou fiscalizando demais o serviço dos outros." },
  { name: "Mosca-morta", emoji: "🪰", kind: VOTE_TITLE, description: "Nem precisa explicar." },
  { name: "Lesma", emoji: "🐌", kind: VOTE_TITLE, description: "O mais lerdo da estação." },
  { name: "Cigarra", emoji: "🦗", kind: VOTE_TITLE, description: "Só fica gritando e não faz nada." },
];

/** The default list as records, numbered from the id the store has free. */
export function defaultSeasonTitles(firstId: number): SeasonTitle[] {
  return DEFAULT_SEASON_TITLES.map((seed, position) => ({ ...seed, id: firstId + position, position, active: true }));
}

/** The crown: the one title nobody votes on and nobody can drop. */
export function crownTitle(titles: SeasonTitle[]): SeasonTitle | null {
  return titles.find((title) => title.kind === AUTO_TITLE) ?? null;
}

/** The titles a colmeia hands out today: what the family votes on and manages. */
export function votedTitles(titles: SeasonTitle[]): SeasonTitle[] {
  return titles.filter((title) => title.kind === VOTE_TITLE && title.active);
}

/** What a closed estação still shows: the titles in use, plus any the colmeia
 *  dropped after somebody had already been called it. */
export function votedTitlesIn(titles: SeasonTitle[], votes: SeasonTitleVote[]): SeasonTitle[] {
  return titles.filter(
    (title) => title.kind === VOTE_TITLE
      && (title.active || votes.some((vote) => vote.seasonTitleId === title.id)),
  );
}

/** The votes cast inside one estação. */
export function votesInSeason(votes: SeasonTitleVote[], seasonId: number): SeasonTitleVote[] {
  return votes.filter((vote) => vote.seasonId === seasonId);
}

/** Who this person voted for in one title, or null while they have not voted. */
export function ownVote(votes: SeasonTitleVote[], titleId: number, voterId: number | null): SeasonTitleVote | null {
  if (voterId === null) return null;
  return votes.find((vote) => vote.seasonTitleId === titleId && vote.voterId === voterId) ?? null;
}
