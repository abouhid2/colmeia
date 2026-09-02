import { describe, expect, it } from "vitest";
import type { Completion, Goal, Season } from "./types";
import { goalProgress, seasonBounds } from "./progress";

const season = (overrides: Partial<Season> = {}): Season => ({
  id: 7, name: "Estação atual", startsOn: "2026-03-09", endsOn: null, closedAt: null,
  createdAt: "2026-03-09T00:00:00.000Z", tasksCount: 0, completionsCount: 0, ...overrides,
});

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, seasonId: 7, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

describe("seasonBounds", () => {
  it("runs from the first day to the end of the last one", () => {
    const bounds = seasonBounds(season({ startsOn: "2026-03-09", endsOn: "2026-03-15" }), new Date(2026, 2, 11, 15));

    expect(bounds.start).toEqual(new Date(2026, 2, 9));
    expect(bounds.end).toEqual(new Date(2026, 2, 15, 23, 59, 59, 999));
  });

  it("runs up to right now while the estação has no end", () => {
    const now = new Date(2026, 2, 11, 15);

    expect(seasonBounds(season(), now).end).toEqual(now);
  });
});

describe("goalProgress", () => {
  const goal: Goal = { id: 1, seasonId: 7, title: "Pizza", targetPoints: 100, memberId: null };
  const now = new Date(2026, 2, 11, 15);

  it("adds approved points of its own estação only", () => {
    const progress = goalProgress(goal, [
      completion({ pointsAwarded: 30 }),
      completion({ id: 2, pointsAwarded: 50, status: "pending" }),
      completion({ id: 3, pointsAwarded: 40, seasonId: 6 }),
    ], season(), now);

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
    ], season(), now);

    expect(progress.earned).toBe(25);
  });

  it("caps the ratio when the goal is beaten", () => {
    const progress = goalProgress(goal, [completion({ pointsAwarded: 130 })], season(), now);

    expect(progress.ratio).toBe(1);
    expect(progress.reached).toBe(true);
    expect(progress.remaining).toBe(0);
  });

  it("counts a goal of a past estação against that estação, not against today", () => {
    const past = season({ id: 6, name: "Estação passada", startsOn: "2026-03-02", endsOn: "2026-03-08", closedAt: "2026-03-09T00:00:00.000Z" });
    const pastGoal: Goal = { ...goal, id: 2, seasonId: 6, targetPoints: 40 };

    const progress = goalProgress(pastGoal, [
      completion({ id: 1, seasonId: 6, pointsAwarded: 40, completedAt: "2026-03-04T10:00:00.000Z" }),
      completion({ id: 2, seasonId: 7, pointsAwarded: 900 }),
    ], past, now);

    expect(progress.earned).toBe(40);
    expect(progress.reached).toBe(true);
    expect(progress.bounds.end).toEqual(new Date(2026, 2, 8, 23, 59, 59, 999));
  });
});
