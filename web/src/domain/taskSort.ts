import { PRIORITIES } from "./priorities";
import { isOverdue } from "./dueDates";
import type { Task } from "./types";

function dueRank(task: Task): number {
  return task.dueOn === null ? Number.MAX_SAFE_INTEGER : Date.parse(task.dueOn);
}

/** Overdue first, then priority, then due date, then bigger prizes. */
export function sortOpenTasks(tasks: Task[], today: Date): Task[] {
  return [...tasks].sort((left, right) => {
    const overdue = Number(isOverdue(right, today)) - Number(isOverdue(left, today));
    if (overdue !== 0) return overdue;
    const priority = PRIORITIES[left.priority].rank - PRIORITIES[right.priority].rank;
    if (priority !== 0) return priority;
    const due = dueRank(left) - dueRank(right);
    if (due !== 0) return due;
    return right.points - left.points;
  });
}

export function sortDoneTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => Date.parse(right.completedAt ?? "") - Date.parse(left.completedAt ?? ""));
}
