import { describe, expect, it } from "vitest";
import type { Completion, Task } from "./types";
import { canReopen, completionsForMember } from "./history";

const completion = (overrides: Partial<Completion> = {}): Completion => ({
  id: 1, seasonId: 7, taskId: 1, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, taskTitle: "Lavar louça", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 1, seasonId: 7, title: "Lavar louça", description: null, points: 10, priority: "medium", recurrence: "none",
  intervalDays: null, dueOn: null, requiresReview: false, status: "done", completedAt: "2026-03-11T10:00:00.000Z",
  assigneeId: null, createdById: null, createdAt: "2026-03-01T10:00:00.000Z", ...overrides,
});

describe("completionsForMember", () => {
  it("returns every completion, newest first, when no one is picked", () => {
    const older = completion({ id: 1, completedAt: "2026-03-10T10:00:00.000Z" });
    const newer = completion({ id: 2, completedAt: "2026-03-11T10:00:00.000Z" });
    expect(completionsForMember([older, newer], null)).toEqual([newer, older]);
  });

  it("narrows to one member's completions", () => {
    const bruno = completion({ id: 1, memberId: 2 });
    const duda = completion({ id: 2, memberId: 3 });
    expect(completionsForMember([bruno, duda], 2)).toEqual([bruno]);
  });

  it("includes a recurring task's completion, which never flips the task to done", () => {
    const recurring = completion({ id: 1, memberId: 5, taskId: 9 });
    expect(completionsForMember([recurring], 5)).toEqual([recurring]);
  });
});

describe("canReopen", () => {
  it("allows a one-off, still-done task", () => {
    expect(canReopen(completion(), task())).toBe(true);
  });

  it("refuses a recurring task", () => {
    expect(canReopen(completion(), task({ recurrence: "weekly" }))).toBe(false);
  });

  it("refuses a task that was already reopened", () => {
    expect(canReopen(completion(), task({ status: "open" }))).toBe(false);
  });

  it("refuses when the task no longer exists", () => {
    expect(canReopen(completion(), null)).toBe(false);
  });

  it("refuses when the completion never pointed at a task", () => {
    expect(canReopen(completion({ taskId: null }), null)).toBe(false);
  });
});
