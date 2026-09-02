import { describe, expect, it } from "vitest";
import type { Completion, Goal, Season } from "./types";
import { goalProgress, goalWindow, seasonBounds } from "./progress";

const season = (overrides: Partial<Season> = {}): Season => ({
  id: 7, name: "Estação atual", startsOn: "2026-03-09", endsOn: null, closedAt: null,
  createdAt: "2026-03-09T00:00:00.000Z", tasksCount: 0, completionsCount: 0, ...overrides,
});

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, seasonId: 7, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

const goal: Goal = { id: 1, seasonId: 7, title: "Pizza", targetPoints: 100, memberIds: [], startsOn: null, endsOn: null };

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

  it("keeps counting past the planned last day while nobody has closed it", () => {
    const now = new Date(2026, 9, 5, 15);

    expect(seasonBounds(season({ startsOn: "2026-09-01", endsOn: "2026-09-30" }), now).end).toEqual(now);
  });

  it("stops at the day it was closed when it never had an end", () => {
    const closed = season({ startsOn: "2026-03-01", closedAt: "2026-03-01T18:00:00.000Z" });

    expect(seasonBounds(closed, new Date(2026, 8, 1)).end).toEqual(new Date("2026-03-01T18:00:00.000Z"));
  });

  it("stops at the day it was closed even with a planned end still ahead", () => {
    const closed = season({ startsOn: "2026-03-01", endsOn: "2026-05-31", closedAt: "2026-03-10T18:00:00.000Z" });

    expect(seasonBounds(closed, new Date(2026, 8, 1)).end).toEqual(new Date("2026-03-10T18:00:00.000Z"));
  });
});

describe("goalWindow", () => {
  const now = new Date(2026, 2, 11, 15);
  const quarter = season({ startsOn: "2026-03-01", endsOn: "2026-05-31" });

  it("is the whole estação when the goal carries no days of its own", () => {
    const window = goalWindow(goal, quarter, now);

    expect(window.start).toEqual(new Date(2026, 2, 1));
    expect(window.end).toEqual(new Date(2026, 4, 31, 23, 59, 59, 999));
  });

  it("is the goal's own stretch when it has one", () => {
    const window = goalWindow({ ...goal, startsOn: "2026-03-09", endsOn: "2026-03-15" }, quarter, now);

    expect(window.start).toEqual(new Date(2026, 2, 9));
    expect(window.end).toEqual(new Date(2026, 2, 15, 23, 59, 59, 999));
  });

  it("borrows the end the estação has when only the start is set", () => {
    expect(goalWindow({ ...goal, startsOn: "2026-04-01" }, quarter, now).end).toEqual(new Date(2026, 4, 31, 23, 59, 59, 999));
  });
});

describe("goalProgress", () => {
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
    expect(progress.status).toBe("active");
  });

  it("counts only the participants' points when the goal names people", () => {
    const shared: Goal = { ...goal, memberIds: [ 2, 3 ] };

    const progress = goalProgress(shared, [
      completion({ pointsAwarded: 30, memberId: 1 }),
      completion({ id: 2, pointsAwarded: 25, memberId: 2 }),
      completion({ id: 3, pointsAwarded: 15, memberId: 3 }),
    ], season(), now);

    expect(progress.earned).toBe(40);
  });

  it("caps the ratio when the goal is beaten", () => {
    const progress = goalProgress(goal, [completion({ pointsAwarded: 130 })], season(), now);

    expect(progress.ratio).toBe(1);
    expect(progress.reached).toBe(true);
    expect(progress.remaining).toBe(0);
    expect(progress.status).toBe("reached");
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
    expect(progress.window.end).toEqual(new Date("2026-03-09T00:00:00.000Z"));
  });

  it("keeps counting what came after the planned last day while the estação is open", () => {
    const september = season({ startsOn: "2026-09-01", endsOn: "2026-09-30" });

    const progress = goalProgress(goal, [
      completion({ id: 1, pointsAwarded: 60, completedAt: "2026-09-20T10:00:00.000Z" }),
      completion({ id: 2, pointsAwarded: 80, completedAt: "2026-10-03T10:00:00.000Z" }),
    ], september, new Date(2026, 9, 5, 12));

    expect(progress).toMatchObject({ earned: 140, reached: true, status: "reached" });
  });

  it("is over once the estação was closed, even without a last day of its own", () => {
    const closed = season({ startsOn: "2026-03-01", closedAt: "2026-03-01T18:00:00.000Z" });

    expect(goalProgress(goal, [], closed, new Date(2026, 8, 1)).status).toBe("missed");
  });

  describe("inside a window of its own", () => {
    const quarter = season({ startsOn: "2026-03-01", endsOn: "2026-05-31" });

    it("leaves out what was scored before the window opened", () => {
      const windowed: Goal = { ...goal, startsOn: "2026-03-10", endsOn: "2026-03-20" };

      const progress = goalProgress(windowed, [
        completion({ id: 1, pointsAwarded: 90, completedAt: "2026-03-05T10:00:00.000Z" }),
        completion({ id: 2, pointsAwarded: 30, completedAt: "2026-03-11T10:00:00.000Z" }),
      ], quarter, now);

      expect(progress.earned).toBe(30);
    });

    it("waits its turn while the window is still ahead", () => {
      const later: Goal = { ...goal, startsOn: "2026-05-01", endsOn: "2026-05-31" };

      expect(goalProgress(later, [], quarter, now).status).toBe("upcoming");
    });

    it("says it was missed once the window closes short of the target", () => {
      const over: Goal = { ...goal, startsOn: "2026-03-01", endsOn: "2026-03-05" };

      const progress = goalProgress(over, [completion({ pointsAwarded: 10, completedAt: "2026-03-03T10:00:00.000Z" })], quarter, now);

      expect(progress).toMatchObject({ earned: 10, status: "missed" });
    });

    it("stays batida when the last day of a closed window was the day it was reached", () => {
      const over: Goal = { ...goal, targetPoints: 40, startsOn: "2026-03-01", endsOn: "2026-03-05" };

      const progress = goalProgress(over, [completion({ pointsAwarded: 40, completedAt: "2026-03-05T23:00:00.000Z" })], quarter, now);

      expect(progress).toMatchObject({ earned: 40, reached: true, status: "reached" });
    });
  });
});
