import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPoints } from "../../domain/points";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { fromIsoDate } from "../../lib/dates";

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
  targetPoints: number;
  seasonName: string;
  /** What they get for reaching it: the goal's title. */
  reward: string;
}

/** One sentence tying the two halves together: the points to reach, then what they pay. */
export function goalPreviewSentence({ ownerName, targetPoints, seasonName, reward }: GoalPreview): string {
  const who = ownerName?.trim() || HOUSEHOLD_OWNER;
  const target = targetPoints > 0 ? `juntar ${formatPoints(targetPoints)}` : "bater a meta";
  const prize = reward.trim() === "" ? "ganha a recompensa combinada" : `ganha: ${reward.trim()}`;
  return `Quando ${who} ${target} na estação ${seasonName.trim()}, ${prize}.`;
}

function formatSeasonDay(iso: string): string {
  return format(fromIsoDate(iso), "d 'de' MMM", { locale: ptBR });
}
