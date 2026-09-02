import { describe, expect, it } from "vitest";
import { completionsInSeason, defaultSeason, lastClosedSeason, resolveSeason, seasonContains, seasonsNewestFirst } from "./seasons";
import type { Completion, Season } from "./types";

const season = (overrides: Partial<Season> & Pick<Season, "id">): Season => ({
  name: "Estação", startsOn: "2026-03-09", endsOn: null, closedAt: null,
  createdAt: "2026-03-09T00:00:00.000Z", tasksCount: 0, completionsCount: 0, ...overrides,
});

const completion = (id: number, seasonId: number): Completion => ({
  id, seasonId, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null,
});

const now = new Date(2026, 2, 11, 15);

describe("seasonContains", () => {
  it("covers its first and last day", () => {
    const bounded = season({ id: 1, startsOn: "2026-03-09", endsOn: "2026-03-15" });

    expect(seasonContains(bounded, new Date(2026, 2, 9))).toBe(true);
    expect(seasonContains(bounded, new Date(2026, 2, 15, 23))).toBe(true);
    expect(seasonContains(bounded, new Date(2026, 2, 8))).toBe(false);
    expect(seasonContains(bounded, new Date(2026, 2, 16))).toBe(false);
  });

  it("never ends while it has no end date", () => {
    expect(seasonContains(season({ id: 1 }), new Date(2030, 0, 1))).toBe(true);
  });
});

describe("completionsInSeason", () => {
  it("keeps what was scored inside it and nothing else", () => {
    const completions = [completion(1, 7), completion(2, 6), completion(3, 7)];

    expect(completionsInSeason(completions, 7).map((item) => item.id)).toEqual([1, 3]);
    expect(completionsInSeason(completions, null)).toEqual([]);
  });
});

describe("seasonsNewestFirst", () => {
  it("orders by start day, newest first", () => {
    const ordered = seasonsNewestFirst([
      season({ id: 1, startsOn: "2026-01-01" }),
      season({ id: 2, startsOn: "2026-03-01" }),
      season({ id: 3, startsOn: "2026-02-01" }),
    ]);

    expect(ordered.map((item) => item.id)).toEqual([2, 3, 1]);
  });
});

describe("lastClosedSeason", () => {
  it("picks the one closed most recently", () => {
    const closed = lastClosedSeason([
      season({ id: 1, closedAt: "2026-02-01T00:00:00.000Z" }),
      season({ id: 2, closedAt: "2026-03-01T00:00:00.000Z" }),
      season({ id: 3 }),
    ]);

    expect(closed?.id).toBe(2);
  });

  it("is null while nothing has been closed", () => {
    expect(lastClosedSeason([season({ id: 1 })])).toBeNull();
  });
});

describe("defaultSeason", () => {
  it("prefers the running estação that covers today", () => {
    const chosen = defaultSeason([
      season({ id: 1, startsOn: "2026-03-09", endsOn: "2026-03-15" }),
      season({ id: 2, startsOn: "2026-04-01", endsOn: "2026-04-30" }),
    ], now);

    expect(chosen?.id).toBe(1);
  });

  it("falls back to the running estação that started most recently", () => {
    const chosen = defaultSeason([
      season({ id: 1, startsOn: "2026-01-01", endsOn: "2026-01-31" }),
      season({ id: 2, startsOn: "2026-02-01", endsOn: "2026-02-28" }),
    ], now);

    expect(chosen?.id).toBe(2);
  });

  it("falls back to a closed estação only when nothing is running", () => {
    const chosen = defaultSeason([
      season({ id: 1, startsOn: "2026-01-01", closedAt: "2026-02-01T00:00:00.000Z" }),
      season({ id: 2, startsOn: "2026-03-01", closedAt: "2026-03-05T00:00:00.000Z" }),
    ], now);

    expect(chosen?.id).toBe(2);
  });

  it("is null in a colmeia with no estação at all", () => {
    expect(defaultSeason([], now)).toBeNull();
  });
});

describe("resolveSeason", () => {
  const seasons = [season({ id: 1, startsOn: "2026-03-09" }), season({ id: 2, startsOn: "2026-01-01", endsOn: "2026-01-31" })];

  it("keeps the estação the browser was on", () => {
    expect(resolveSeason(seasons, 2, now)?.id).toBe(2);
  });

  it("falls back to the default when the stored one is gone", () => {
    expect(resolveSeason(seasons, 99, now)?.id).toBe(1);
    expect(resolveSeason(seasons, null, now)?.id).toBe(1);
  });
});
