import { describe, expect, it } from "vitest";
import type { Completion, Goal } from "./types";
import { goalProgress, periodBounds } from "./progress";

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

describe("periodBounds", () => {
  it("starts weeks on Monday", () => {
    const bounds = periodBounds("week", new Date(2026, 2, 11, 15)); // a Wednesday
    expect(bounds.start).toEqual(new Date(2026, 2, 9));
    expect(bounds.end).toEqual(new Date(2026, 2, 16));
  });

  it("covers the calendar month", () => {
    const bounds = periodBounds("month", new Date(2026, 2, 11));
    expect(bounds.start).toEqual(new Date(2026, 2, 1));
    expect(bounds.end).toEqual(new Date(2026, 3, 1));
  });
});

describe("goalProgress", () => {
  const goal: Goal = { id: 1, title: "Pizza", targetPoints: 100, period: "week", memberId: null };
  const now = new Date(2026, 2, 11, 15);

  it("adds approved points inside the period only", () => {
    const progress = goalProgress(goal, [
      completion({ pointsAwarded: 30 }),
      completion({ id: 2, pointsAwarded: 50, status: "pending" }),
      completion({ id: 3, pointsAwarded: 40, completedAt: "2026-03-02T10:00:00.000Z" }),
    ], now);
    expect(progress.earned).toBe(30);
    expect(progress.remaining).toBe(70);
    expect(progress.ratio).toBeCloseTo(0.3);
    expect(progress.reached).toBe(false);
  });

  it("counts only the owner's points on a personal goal", () => {
    const personal: Goal = { ...goal, memberId: 2 };
    const progress = goalProgress(personal, [
      completion({ pointsAwarded: 30, memberId: 1 }),
      completion({ id: 2, pointsAwarded: 25, memberId: 2 }),
    ], now);
    expect(progress.earned).toBe(25);
  });

  it("caps the ratio when the goal is beaten", () => {
    const progress = goalProgress(goal, [completion({ pointsAwarded: 130 })], now);
    expect(progress.ratio).toBe(1);
    expect(progress.reached).toBe(true);
    expect(progress.remaining).toBe(0);
  });
});
