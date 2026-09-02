import { differenceInCalendarDays, format, formatDistanceStrict, formatISO, isSameDay, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function toIsoDate(date: Date): string {
  return formatISO(date, { representation: "date" });
}

export function fromIsoDate(iso: string): Date {
  return parseISO(iso);
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), "d MMM", { locale: ptBR });
}

export function formatLongDate(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function daysUntil(iso: string, today: Date): number {
  return differenceInCalendarDays(parseISO(iso), today);
}

/** What a native time input wants, in the browser's own zone. */
export function toTimeInput(date: Date): string {
  return format(date, "HH:mm");
}

/** What the native date and time inputs mean together, read as local time. An
 *  incomplete pair gives an invalid Date, which the rules then refuse. */
export function fromDateAndTimeInput(date: string, time: string): Date {
  return parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
}

/** "14 de ago às 18:30", to drop inside a sentence. */
export function momentPhrase(date: Date): string {
  return format(date, "d 'de' MMM 'às' HH:mm", { locale: ptBR });
}

/** "14 de ago": the same sentence form, when the hour does not matter. */
export function dayPhrase(date: Date): string {
  return format(date, "d 'de' MMM", { locale: ptBR });
}

/**
 * When a completion happened: relative while it is still today, absolute once
 * it is not. "há 5 dias" hides which day, and a task registered after the fact
 * is all about which day.
 */
export function completedLabel(iso: string, now: Date): string {
  const moment = parseISO(iso);
  if (!isSameDay(moment, now)) return format(moment, "d 'de' MMM', 'HH:mm", { locale: ptBR });
  return formatDistanceStrict(moment, now, { locale: ptBR, addSuffix: true });
}
