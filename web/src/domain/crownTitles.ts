import type { Member } from "./types";

export const DEFAULT_CROWN_TITLE = "Abelha Rainha";

/** One tap fills the field; anything else is fair game. */
export const CROWN_TITLE_SUGGESTIONS = [DEFAULT_CROWN_TITLE, "Abelhão"];

/** Everyone who is not wearing the crown right now. */
export const WORKER_BEE_LABEL = "Abelha operária";

const THIS_SEASON = "desta estação";

/** A blank title is how someone opts out: they never wear the crown. */
export function wantsCrown(member: Pick<Member, "crownTitle">): boolean {
  return member.crownTitle.trim() !== "";
}

/** "Rei da Louça desta estação", the line under the name on a crowned profile. */
export function crownedTitle(crownTitle: string): string {
  return `${crownTitle.trim()} ${THIS_SEASON}`;
}

export const CROWN_EXPLANATION =
  "Quem mais pontuou na última estação encerrada e bateu a meta usa o título que escolheu até esta estação acabar.";
