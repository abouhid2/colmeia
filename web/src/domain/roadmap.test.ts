import { describe, expect, it } from "vitest";
import { markerAnchor, roadmapBar, roadmapMarker, roadmapSpan, OPEN_SEASON_DAYS } from "./roadmap";
import type { Season } from "./types";

const now = new Date(2026, 8, 16, 12);

const season = (overrides: Partial<Season> = {}): Season => ({
  id: 7, name: "Estação", startsOn: "2026-09-01", endsOn: "2026-09-30", closedAt: null,
  createdAt: "2026-09-01T00:00:00.000Z", tasksCount: 0, completionsCount: 0, ...overrides,
});

describe("roadmapSpan", () => {
  it("covers the estação from its first day to its last", () => {
    const span = roadmapSpan(season(), now);

    expect(span).toMatchObject({ openEnded: false });
    expect(span.start).toEqual(new Date(2026, 8, 1));
    expect(span.end).toEqual(new Date(2026, 8, 30, 23, 59, 59, 999));
  });

  it("draws a month past today when the estação has no end, and says so", () => {
    const span = roadmapSpan(season({ endsOn: null }), now);

    expect(span.openEnded).toBe(true);
    expect(span.end).toEqual(new Date(2026, 9, 16, 23, 59, 59, 999));
    expect(OPEN_SEASON_DAYS).toBe(30);
  });

  it("stops on the day a closed estação was frozen, and no longer draws ahead", () => {
    const frozen = season({ endsOn: null, closedAt: "2026-09-10T18:00:00.000Z" });

    const span = roadmapSpan(frozen, now);

    expect(span.openEnded).toBe(false);
    expect(span.end).toEqual(new Date("2026-09-10T18:00:00.000Z"));
    expect(roadmapMarker(now, span)).toBeNull();
  });
});

describe("roadmapBar", () => {
  const span = roadmapSpan(season(), now);

  it("puts the first half on the left half", () => {
    const bar = roadmapBar({ start: new Date(2026, 8, 1), end: new Date(2026, 8, 15, 23, 59, 59, 999) }, span);

    expect(bar.left).toBe(0);
    expect(bar.width).toBeCloseTo(50, 0);
  });

  it("keeps a single day wide enough to see, still inside the roteiro", () => {
    const bar = roadmapBar({ start: new Date(2026, 8, 30), end: new Date(2026, 8, 30, 23, 59, 59, 999) }, span);

    expect(bar.width).toBeGreaterThanOrEqual(3);
    expect(bar.left + bar.width).toBeLessThanOrEqual(100);
  });

  it("clamps a window that runs past the roteiro", () => {
    const bar = roadmapBar({ start: new Date(2026, 7, 1), end: new Date(2026, 10, 1) }, span);

    expect(bar).toMatchObject({ left: 0, width: 100 });
  });
});

describe("roadmapMarker", () => {
  it("puts today halfway through a month that is half gone", () => {
    expect(roadmapMarker(now, roadmapSpan(season(), now))).toBeCloseTo(51.7, 1);
  });

  it("says nothing when today is not on the roteiro at all", () => {
    expect(roadmapMarker(new Date(2026, 10, 1), roadmapSpan(season(), now))).toBeNull();
  });
});

describe("markerAnchor", () => {
  it("leans the label away from the edges of the roteiro", () => {
    expect(markerAnchor(0)).toBe("start");
    expect(markerAnchor(50)).toBe("center");
    expect(markerAnchor(100)).toBe("end");
  });
});
