import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { fromIsoDate } from "../../lib/dates";

export const SEASON_GOAL_TITLE = "Meta da estação";
export const SEASON_SCOPE_LABEL = "Esta estação";
export const ALL_TIME_SCOPE_LABEL = "Desde sempre";
/** Under a ranking or a feed: which stretch of time the numbers cover. */
export const IN_SEASON_HINT = "Nesta estação";

/** "até 30 de set", or the plain truth when the estação has no end. */
export function seasonEnding(season: Season): string {
  return season.endsOn === null ? "sem data de fim" : `até ${formatSeasonDay(season.endsOn)}`;
}

/** "9 de mar até 15 de mar", the line under an estação in a list. */
export function seasonRange(season: Season): string {
  return `${formatSeasonDay(season.startsOn)} · ${seasonEnding(season)}`;
}

export function seasonStatus(season: Season): string {
  return isClosed(season) ? "encerrada" : "em andamento";
}

function formatSeasonDay(iso: string): string {
  return format(fromIsoDate(iso), "d 'de' MMM", { locale: ptBR });
}
