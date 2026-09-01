import { daysUntil, formatShortDate } from "../lib/dates";
import type { Task } from "./types";

export type DueTone = "overdue" | "today" | "soon" | "later";

export interface DueInfo {
  label: string;
  tone: DueTone;
}

export function isOverdue(task: Pick<Task, "dueOn" | "status">, today: Date): boolean {
  return task.status === "open" && task.dueOn !== null && daysUntil(task.dueOn, today) < 0;
}

export function describeDue(dueOn: string, today: Date): DueInfo {
  const days = daysUntil(dueOn, today);
  if (days < -1) return { label: `Venceu há ${-days} dias`, tone: "overdue" };
  if (days === -1) return { label: "Venceu ontem", tone: "overdue" };
  if (days === 0) return { label: "Hoje", tone: "today" };
  if (days === 1) return { label: "Amanhã", tone: "soon" };
  if (days <= 6) return { label: `Em ${days} dias`, tone: "soon" };
  return { label: formatShortDate(dueOn), tone: "later" };
}
