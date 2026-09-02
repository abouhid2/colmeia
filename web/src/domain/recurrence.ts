import { addDays, addMonths, addWeeks } from "date-fns";
import { toIsoDate } from "../lib/dates";
import type { Recurrence, Task } from "./types";

interface RecurrenceMeta {
  label: string;
  short: string;
}

export const RECURRENCES: Record<Recurrence, RecurrenceMeta> = {
  none: { label: "Uma vez só", short: "Pontual" },
  daily: { label: "Todo dia", short: "Diária" },
  weekly: { label: "Uma vez por semana", short: "Semanal" },
  weekdays: { label: "Em dias da semana", short: "Dias certos" },
  monthly: { label: "Uma vez por mês", short: "Mensal" },
  custom: { label: "A cada tantos dias", short: "Personalizada" },
};

export const RECURRENCE_OPTIONS: Recurrence[] = ["none", "daily", "weekly", "weekdays", "monthly", "custom"];

/** The week the way Date#getDay counts it: 0 is domingo. */
export const WEEKDAY_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const WEEKDAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function weekdayName(day: number): string {
  return WEEKDAY_NAMES[day] ?? "";
}

export function weekdayShort(day: number): string {
  return WEEKDAY_SHORT[day] ?? "";
}

/** The days somebody chose, read out loud: "seg, qua e sex". */
export function weekdaysPhrase(weekdays: number[]): string {
  const names = [ ...weekdays ].sort((left, right) => left - right).map(weekdayShort);
  const [ first ] = names;
  if (first === undefined) return "";
  if (names.length === 1) return first;
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function isRecurring(recurrence: Recurrence): boolean {
  return recurrence !== "none";
}

export function recurrenceLabel(task: Pick<Task, "recurrence" | "intervalDays" | "weekdays">): string {
  if (task.recurrence === "custom") {
    return `A cada ${task.intervalDays ?? "?"} dias`;
  }
  if (task.recurrence === "weekdays") {
    return weekdaysPhrase(task.weekdays ?? []) || RECURRENCES.weekdays.short;
  }
  return RECURRENCES[task.recurrence].short;
}

/**
 * Next due date after a completion. Counts from the completion day, not the
 * previous due date: a bathroom cleaned two days late is still clean for a week.
 */
export function nextDueOn(task: Pick<Task, "recurrence" | "intervalDays" | "weekdays">, from: Date): string | null {
  switch (task.recurrence) {
    case "daily":
      return toIsoDate(addDays(from, 1));
    case "weekly":
      return toIsoDate(addWeeks(from, 1));
    case "weekdays":
      return nextWeekdayAfter(task.weekdays ?? [], from);
    case "monthly":
      return toIsoDate(addMonths(from, 1));
    case "custom":
      return toIsoDate(addDays(from, task.intervalDays ?? 1));
    default:
      return null;
  }
}

/**
 * The first chosen day that comes after the day the work happened, so a task
 * set for Tuesday and done on Tuesday comes back on the next chosen day.
 */
function nextWeekdayAfter(weekdays: number[], from: Date): string | null {
  if (weekdays.length === 0) return null;
  for (let step = 1; step <= 7; step += 1) {
    const day = addDays(from, step);
    if (weekdays.includes(day.getDay())) return toIsoDate(day);
  }
  return null;
}
