import { describe, expect, it } from "vitest";
import { memberStats } from "./memberStats";
import type { Completion } from "./types";

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

describe("memberStats", () => {
  it("has nothing to show for someone who just joined", () => {
    expect(memberStats(1, [])).toEqual({ tasksCount: 0, points: 0, averageRating: null, reviewsGiven: 0 });
  });

  it("averages only the completions that were rated", () => {
    const stats = memberStats(1, [
      completion({ id: 1, rating: 5 }),
      completion({ id: 2, rating: 2 }),
      completion({ id: 3, rating: null }),
    ]);

    expect(stats.averageRating).toBe(3.5);
    expect(stats.tasksCount).toBe(3);
  });

  it("separates work done from reviews given", () => {
    const stats = memberStats(1, [
      completion({ id: 1, memberId: 1, pointsAwarded: 20 }),
      completion({ id: 2, memberId: 2, reviewerId: 1, pointsAwarded: 90 }),
    ]);

    expect(stats).toMatchObject({ tasksCount: 1, points: 20, reviewsGiven: 1 });
  });
});
