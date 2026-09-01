import { differenceInCalendarDays, format, formatDistanceToNowStrict, formatISO, parseISO } from "date-fns";
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

export function timeAgo(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { locale: ptBR, addSuffix: true });
}

export function daysUntil(iso: string, today: Date): number {
  return differenceInCalendarDays(parseISO(iso), today);
}
