import { describe, expect, it } from "vitest";
import { achievementHistory, achievementRecords, missingAwards } from "./achievementHistory";
import { achievementEvents, memberAchievements, type AchievementId } from "./achievements";
import type { AchievementAward, Completion } from "./types";

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

const award = (key: AchievementId, completionId: number | null, awardedAt: string, id = 1): AchievementAward =>
  ({ id, memberId: 1, key, completionId, awardedAt });

const heavy = [
  completion({ id: 1, taskPoints: 50, completedAt: "2026-03-01T10:00:00.000Z" }),
  completion({ id: 2, taskPoints: 50, completedAt: "2026-03-05T10:00:00.000Z" }),
];

const eventsFor = (completions: Completion[]) => achievementEvents({ memberId: 1, completions, tasks: [] });

function find(records: ReturnType<typeof achievementRecords>, id: AchievementId) {
  const found = records.find((record) => record.id === id);
  if (!found) throw new Error(`no achievement ${id}`);
  return found;
}

describe("missingAwards", () => {
  it("asks for everything when nothing was ever written down", () => {
    const missing = missingAwards(eventsFor(heavy), []);

    expect(missing.filter((input) => input.key === "bigTask").map((input) => input.completionId)).toEqual([1, 2]);
  });

  it("skips what the store already has", () => {
    const stored = [award("bigTask", 1, "2026-03-01T10:00:00.000Z"), award("firstTask", 1, "2026-03-01T10:00:00.000Z", 2)];

    const missing = missingAwards(eventsFor(heavy), stored);

    expect(missing.map((input) => [input.key, input.completionId])).toEqual([["bigTask", 2]]);
  });

  it("never asks for a milestone twice, even from another completion", () => {
    const stored = [award("firstTask", 99, "2026-02-01T10:00:00.000Z")];

    const missing = missingAwards(eventsFor(heavy), stored);

    expect(missing.map((input) => input.key)).not.toContain("firstTask");
  });

  it("asks for nothing when the store is up to date" , () => {
    const events = eventsFor(heavy);
    const stored = events.map((event, index) => award(event.id, event.completionId, event.awardedAt, index + 1));

    expect(missingAwards(events, stored)).toEqual([]);
  });
});

describe("achievementHistory", () => {
  it("keeps a milestone once and a repeatable badge every time", () => {
    const history = achievementHistory(eventsFor(heavy), []);

    expect(history.filter((moment) => moment.key === "firstTask")).toHaveLength(1);
    expect(history.filter((moment) => moment.key === "bigTask")).toHaveLength(2);
  });

  it("holds on to what was written down after its completion is gone", () => {
    const stored = [award("bigTask", 77, "2026-01-01T10:00:00.000Z")];

    const history = achievementHistory(eventsFor(heavy), stored);

    expect(history.map((moment) => moment.completionId)).toContain(77);
    expect(history[0]?.awardedAt).toBe("2026-01-01T10:00:00.000Z");
  });
});

describe("achievementRecords", () => {
  it("counts a repeatable badge and dates the first and the last", () => {
    const records = achievementRecords(memberAchievements({ memberId: 1, completions: heavy, tasks: [] }), eventsFor(heavy), []);

    expect(find(records, "bigTask")).toMatchObject({
      unlocked: true, count: 2, firstAwardedAt: "2026-03-01T10:00:00.000Z", lastAwardedAt: "2026-03-05T10:00:00.000Z",
    });
  });

  it("keeps a badge unlocked once it is written down, even with the data gone", () => {
    const stored = [award("fiftyTasks", 5, "2026-02-02T10:00:00.000Z")];

    const records = achievementRecords(memberAchievements({ memberId: 1, completions: [], tasks: [] }), [], stored);

    expect(find(records, "fiftyTasks")).toMatchObject({ unlocked: true, count: 1, firstAwardedAt: "2026-02-02T10:00:00.000Z" });
    expect(find(records, "tenTasks")).toMatchObject({ unlocked: false, count: 0, firstAwardedAt: null });
  });
});
