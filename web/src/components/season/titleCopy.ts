import type { Crown } from "../../domain/crown";
import { leadersOf, type TitleResult } from "../../domain/titleResults";

/** "3 votos", "1 voto". */
export function voteCount(votes: number): string {
  return `${votes} ${votes === 1 ? "voto" : "votos"}`;
}

/** Names the way a sentence lists them: "Bruno, Clara e Duda". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

/** What an estação decided about one título, in one line. */
export function titleResultLine(result: TitleResult): string {
  if (result.totalVotes === 0) return "Ninguém votou ainda";

  const leaders = leadersOf(result.tallies);
  if (leaders.length === 0) return "Quem levou esse título já saiu da colmeia";
  if (leaders.length > 1) return `Empate entre ${joinNames(leaders.map((tally) => tally.member.name))}`;

  const [ top ] = leaders;
  return `${result.title.name} da estação: ${top.member.name}, ${voteCount(top.votes)}`;
}

/** Under the ranking of a closed estação: whether the crown was won at all. */
export function crownVerdict(goalReached: boolean | null, hasWinner: boolean): string | null {
  if (goalReached === false) return "Meta não batida, ninguém leva a coroa";
  if (!hasWinner) return null;
  return goalReached === true ? "Meta da colmeia batida" : null;
}

/** What the crown of one estação came to, in one line. */
export function crownTitleLine(closed: boolean, winner: Crown | null, goalReached: boolean | null): string {
  if (!closed) return "A coroa sai quando a estação encerrar";
  if (winner !== null) return `${winner.member.name} venceu, como ${winner.member.crownTitle}`;
  return goalReached === false ? "Meta não batida, ninguém levou" : "Ninguém levou desta vez";
}
