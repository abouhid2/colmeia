import { addMinutes, subDays } from "date-fns";
import { toIsoDate } from "../lib/dates";

/** How far back a person may claim to have done something. Past a year the
 *  entry is a typo more often than a memory. Same ceiling as Tasks::Complete. */
export const MAX_BACKDATE_DAYS = 365;
/** A phone's clock sits a minute or two ahead often enough that "agora" would
 *  otherwise come back refused as the future. */
export const CLOCK_SKEW_MINUTES = 2;

/**
 * Why a moment cannot be when something was done, or null when it can. The
 * person's own memory is taken at face value between those edges.
 *
 * The estação is checked before the one-year bound because it is almost always
 * the tighter of the two, and naming it is the more useful answer. Pass null
 * for the start when there is no estação to answer for.
 */
export function completedAtError(moment: Date, now: Date, seasonStartsOn: string | null): string | null {
  if (Number.isNaN(moment.getTime())) return "Não deu para entender essa data";
  if (moment > addMinutes(now, CLOCK_SKEW_MINUTES)) return "Essa data está no futuro";
  if (seasonStartsOn !== null && toIsoDate(moment) < seasonStartsOn) return "Essa data é de antes da estação começar";
  if (moment < subDays(now, MAX_BACKDATE_DAYS)) return "Só dá para registrar até um ano atrás";
  return null;
}
