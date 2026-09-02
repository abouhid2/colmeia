import type { GoalPeriod, Member } from "./types";

export const DEFAULT_CROWN_TITLE = "Abelha Rainha";

/** One tap fills the field; anything else is fair game. */
export const CROWN_TITLE_SUGGESTIONS = [DEFAULT_CROWN_TITLE, "Abelhão"];

/** Everyone who is not wearing the crown right now. */
export const WORKER_BEE_LABEL = "Abelha operária";

const THIS_PERIOD: Record<GoalPeriod, string> = { week: "desta semana", month: "deste mês" };

/** A blank title is how someone opts out: they never wear the crown. */
export function wantsCrown(member: Pick<Member, "crownTitle">): boolean {
  return member.crownTitle.trim() !== "";
}

/** "Rei da Louça desta semana", the line under the name on a crowned profile. */
export function crownedTitle(crownTitle: string, period: GoalPeriod): string {
  return `${crownTitle.trim()} ${THIS_PERIOD[period]}`;
}

export function crownExplanation(period: GoalPeriod): string {
  const won = period === "week" ? "na semana passada" : "no mês passado";
  return `Quem mais pontuou ${won} com a meta batida ganha o título que escolheu (Abelha Rainha, Abelhão ou o que quiser) até o fim ${THIS_PERIOD[period]}.`;
}
