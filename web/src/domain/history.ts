import type { Completion, Task } from "./types";

/**
 * What one person actually did, newest first. Unlike a task's own status,
 * this also covers recurring tasks: they roll their due date instead of
 * turning "done", but every time they're completed a Completion is recorded.
 */
export function completionsForMember(completions: Completion[], memberId: number | null): Completion[] {
  const scoped = memberId === null ? completions : completions.filter((completion) => completion.memberId === memberId);
  return [...scoped].sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt));
}

/** Reopening only makes sense for a one-off task that still exists and is still done. */
export function canReopen(completion: Completion, task: Task | null): boolean {
  if (completion.taskId === null || task === null) return false;
  return task.recurrence === "none" && task.status === "done";
}
