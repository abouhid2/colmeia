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
  weekly: { label: "Toda semana", short: "Semanal" },
  monthly: { label: "Todo mês", short: "Mensal" },
  custom: { label: "A cada tantos dias", short: "Personalizada" },
};

export const RECURRENCE_OPTIONS: Recurrence[] = ["none", "daily", "weekly", "monthly", "custom"];

export function isRecurring(recurrence: Recurrence): boolean {
  return recurrence !== "none";
}

export function recurrenceLabel(task: Pick<Task, "recurrence" | "intervalDays">): string {
  if (task.recurrence === "custom") {
    return `A cada ${task.intervalDays ?? "?"} dias`;
  }
  return RECURRENCES[task.recurrence].short;
}

/**
 * Next due date after a completion. Counts from the completion day, not the
 * previous due date: a bathroom cleaned two days late is still clean for a week.
 */
export function nextDueOn(recurrence: Recurrence, intervalDays: number | null, from: Date): string | null {
  switch (recurrence) {
    case "daily":
      return toIsoDate(addDays(from, 1));
    case "weekly":
      return toIsoDate(addWeeks(from, 1));
    case "monthly":
      return toIsoDate(addMonths(from, 1));
    case "custom":
      return toIsoDate(addDays(from, intervalDays ?? 1));
    default:
      return null;
  }
}
