import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPoints } from "../../domain/points";
import type { GoalStatus } from "../../domain/progress";
import { isClosed } from "../../domain/seasons";
import type { Goal, Member, Season } from "../../domain/types";
import { daysUntil, fromIsoDate } from "../../lib/dates";

/** How a collective goal names its owner inside a sentence. */
export const HOUSEHOLD_OWNER = "a colmeia";

export const SEASON_SCOPE_LABEL = "Esta estação";
export const ALL_TIME_SCOPE_LABEL = "Desde sempre";
/** Under a ranking or a feed: which stretch of time the numbers cover. */
export const IN_SEASON_HINT = "Nesta estação";

/** "até 30 de set", or the plain truth when the estação has no end. */
export function seasonEnding(season: Season): string {
  return season.endsOn === null ? "sem data de fim" : `até ${formatSeasonDay(season.endsOn)}`;
}

/** "9 de mar · até 15 de mar", the line under an estação in a list. */
export function seasonRange(season: Season): string {
  return `${formatSeasonDay(season.startsOn)} · ${seasonEnding(season)}`;
}

export function seasonStatus(season: Season): string {
  return isClosed(season) ? "encerrada" : "em andamento";
}

export interface GoalPreview {
  /** null while the whole colmeia works towards it. */
  ownerName: string | null;
  /** More than one person is named, so the verbs go plural. */
  plural?: boolean;
  targetPoints: number;
  seasonName: string;
  /** What they get for reaching it: the goal's title. */
  reward: string;
}

/** One sentence tying the two halves together: the points to reach, then what they pay. */
export function goalPreviewSentence({ ownerName, plural = false, targetPoints, seasonName, reward }: GoalPreview): string {
  const who = ownerName?.trim() || HOUSEHOLD_OWNER;
  const target = targetPoints > 0
    ? `${plural ? "juntarem" : "juntar"} ${formatPoints(targetPoints)}`
    : `${plural ? "baterem" : "bater"} a meta`;
  const wins = plural ? "ganham" : "ganha";
  const prize = reward.trim() === "" ? `${wins} a recompensa combinada` : `${wins}: ${reward.trim()}`;
  return `Quando ${who} ${target} na estação ${seasonName.trim()}, ${prize}.`;
}

function formatSeasonDay(iso: string): string {
  return format(fromIsoDate(iso), "d 'de' MMM", { locale: ptBR });
}

/** How many names a card spells out before the rest become a number. */
const NAMES_SPELLED_OUT = 3;

/** "Ana e Duda", "Ana, Bruno e Duda", "Ana, Bruno e mais 2". */
export function participantsLabel(members: Member[]): string {
  const names = members.map((member) => member.name);
  if (names.length === 0) return "A colmeia inteira";
  if (names.length > NAMES_SPELLED_OUT) return `${names[0]}, ${names[1]} e mais ${names.length - 2}`;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

/** "de 1 de set a 30 de set", the days a goal actually counts. */
export function goalWindowRange(goal: Pick<Goal, "startsOn" | "endsOn">, season: Season): string {
  const start = formatSeasonDay(goal.startsOn ?? season.startsOn);
  const end = goal.endsOn ?? season.endsOn;
  return end === null ? `de ${start} até o fim da estação` : `de ${start} a ${formatSeasonDay(end)}`;
}

/** The same days as a line of their own: "De 1 de set a 30 de set". */
export function goalWindowPhrase(goal: Pick<Goal, "startsOn" | "endsOn">, season: Season): string {
  const range = goalWindowRange(goal, season);
  return range.charAt(0).toUpperCase() + range.slice(1);
}

/** Where a goal fits inside its estação, for the middle of a sentence. */
export function goalStretchPhrase(goal: Pick<Goal, "startsOn" | "endsOn">, season: Season): string {
  const wholeSeason = goal.startsOn === null && goal.endsOn === null;
  return wholeSeason ? "nesta estação" : goalWindowRange(goal, season);
}

/** Whether a goal only counts part of its estação. */
export function hasOwnWindow(goal: Pick<Goal, "startsOn" | "endsOn">): boolean {
  return goal.startsOn !== null || goal.endsOn !== null;
}

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  upcoming: "a começar",
  active: "em andamento",
  reached: "batida",
  missed: "não bateu",
};

/** "começa hoje", "começa amanhã", "começa em 12 dias". */
export function goalOpeningPhrase(startsOn: string, now: Date): string {
  const days = daysUntil(startsOn, now);
  if (days <= 0) return "começa hoje";
  return days === 1 ? "começa amanhã" : `começa em ${days} dias`;
}
