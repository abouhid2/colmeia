import { describe, expect, it } from "vitest";
import { achievementEvents, isRepeatable, memberAchievements, type AchievementId } from "./achievements";
import type { Completion, Task } from "./types";

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, seasonId: 7, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

const task = (overrides: Partial<Task>): Task => ({
  id: 1, seasonId: 7, title: "x", description: null, points: 10, priority: "medium", recurrence: "none", intervalDays: null, weekdays: [],
  dueOn: null, requiresReview: false, kidFriendly: false, status: "open", completedAt: null, assigneeIds: [], createdById: null,
  createdAt: "2026-03-01T10:00:00.000Z", ...overrides,
});

const onDay = (day: number, overrides: Partial<Completion> = {}): Completion =>
  completion({ id: 100 + day, completedAt: `2026-03-${String(day).padStart(2, "0")}T12:00:00.000Z`, ...overrides });

function find(achievements: ReturnType<typeof memberAchievements>, id: AchievementId) {
  const found = achievements.find((achievement) => achievement.id === id);
  if (!found) throw new Error(`no achievement ${id}`);
  return found;
}

describe("memberAchievements", () => {
  it("locks everything for someone who never did a thing", () => {
    const achievements = memberAchievements({ memberId: 1, completions: [], tasks: [] });

    expect(achievements.every((achievement) => !achievement.unlocked)).toBe(true);
    expect(find(achievements, "tenTasks").progress).toBe("0 de 10 tarefas");
  });

  it("unlocks the first task and shows how far the next one is", () => {
    const achievements = memberAchievements({ memberId: 1, completions: [completion({})], tasks: [] });

    expect(find(achievements, "firstTask").unlocked).toBe(true);
    expect(find(achievements, "tenTasks")).toMatchObject({ unlocked: false, current: 1, progress: "1 de 10 tarefas" });
  });

  it("counts only this member's own completions", () => {
    const achievements = memberAchievements({
      memberId: 1,
      completions: [completion({ id: 1, memberId: 2 }), completion({ id: 2, memberId: null })],
      tasks: [],
    });

    expect(find(achievements, "firstTask").unlocked).toBe(false);
  });

  it("counts tasks waiting on a review but pays no points for them", () => {
    const achievements = memberAchievements({
      memberId: 1,
      completions: [completion({ status: "pending", pointsAwarded: 0, taskPoints: 200 })],
      tasks: [],
    });

    expect(find(achievements, "firstTask").unlocked).toBe(true);
    expect(find(achievements, "hundredPoints").current).toBe(0);
  });

  it("adds up points and caps the progress at the target", () => {
    const achievements = memberAchievements({
      memberId: 1,
      completions: [completion({ id: 1, pointsAwarded: 90 }), completion({ id: 2, pointsAwarded: 40 })],
      tasks: [],
    });

    expect(find(achievements, "hundredPoints")).toMatchObject({ unlocked: true, current: 100, progress: "100 de 100 pontos" });
    expect(find(achievements, "fiveHundredPoints").current).toBe(130);
  });

  it("unlocks Impecável only on a five-star rating", () => {
    const four = memberAchievements({ memberId: 1, completions: [completion({ rating: 4 })], tasks: [] });
    const five = memberAchievements({ memberId: 1, completions: [completion({ rating: 5 })], tasks: [] });

    expect(find(four, "flawless").unlocked).toBe(false);
    expect(find(five, "flawless").unlocked).toBe(true);
  });

  it("counts reviews this member gave, not the ones they received", () => {
    const completions = [1, 2, 3, 4, 5].map((id) => completion({ id, memberId: 2, reviewerId: 1, rating: 3 }));
    const achievements = memberAchievements({ memberId: 1, completions, tasks: [] });

    expect(find(achievements, "fiveReviews").unlocked).toBe(true);
    expect(find(achievements, "firstTask").unlocked).toBe(false);
  });

  it("reads urgency off the task, not the completion", () => {
    const tasks = [task({ id: 7, priority: "urgent" }), task({ id: 8, priority: "high" })];

    expect(find(memberAchievements({ memberId: 1, completions: [completion({ taskId: 8 })], tasks }), "urgentTask").unlocked).toBe(false);
    expect(find(memberAchievements({ memberId: 1, completions: [completion({ taskId: 7 })], tasks }), "urgentTask").unlocked).toBe(true);
  });

  it("stays locked on a heavy task when the task was deleted", () => {
    const achievements = memberAchievements({
      memberId: 1,
      completions: [completion({ taskId: null, taskPoints: 50 })],
      tasks: [task({ id: 7, priority: "urgent" })],
    });

    expect(find(achievements, "urgentTask").unlocked).toBe(false);
    expect(find(achievements, "bigTask").unlocked).toBe(true);
  });

  it("needs a task worth 50 points or more for Missão pesada", () => {
    const achievements = memberAchievements({ memberId: 1, completions: [completion({ taskPoints: 49 })], tasks: [] });

    expect(find(achievements, "bigTask").unlocked).toBe(false);
  });

  it("counts distinct days, so three tasks in one day are one day", () => {
    const sameDay = [onDay(3), onDay(3, { id: 900 }), onDay(3, { id: 901 })];
    const spread = [3, 4, 5, 6, 7, 9, 10].map((day) => onDay(day));

    expect(find(memberAchievements({ memberId: 1, completions: sameDay, tasks: [] }), "sevenDays").current).toBe(1);
    expect(find(memberAchievements({ memberId: 1, completions: spread, tasks: [] }), "sevenDays")).toMatchObject({ unlocked: true, progress: "7 de 7 dias" });
  });
});

describe("achievementEvents", () => {
  it("gives nothing to someone who never did a thing", () => {
    expect(achievementEvents({ memberId: 1, completions: [], tasks: [] })).toEqual([]);
  });

  it("hangs a milestone on the completion that crossed it", () => {
    const completions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => onDay(day));

    const events = achievementEvents({ memberId: 1, completions, tasks: [] });

    expect(events.find((event) => event.id === "firstTask")).toMatchObject({ completionId: 101, awardedAt: "2026-03-01T12:00:00.000Z" });
    expect(events.find((event) => event.id === "tenTasks")).toMatchObject({ completionId: 110, awardedAt: "2026-03-10T12:00:00.000Z" });
    expect(events.find((event) => event.id === "sevenDays")?.completionId).toBe(107);
    expect(events.filter((event) => event.id === "firstTask")).toHaveLength(1);
  });

  it("awards a repeatable badge once per completion that earns it", () => {
    const completions = [
      completion({ id: 1, taskPoints: 50, completedAt: "2026-03-01T10:00:00.000Z" }),
      completion({ id: 2, taskPoints: 80, completedAt: "2026-03-05T10:00:00.000Z" }),
      completion({ id: 3, taskPoints: 10, completedAt: "2026-03-06T10:00:00.000Z" }),
    ];

    const events = achievementEvents({ memberId: 1, completions, tasks: [] }).filter((event) => event.id === "bigTask");

    expect(events.map((event) => event.completionId)).toEqual([1, 2]);
  });

  it("dates Impecável by the review, not by the task being done", () => {
    const completions = [completion({ id: 4, rating: 5, completedAt: "2026-03-01T10:00:00.000Z", reviewedAt: "2026-03-02T20:00:00.000Z" })];

    const events = achievementEvents({ memberId: 1, completions, tasks: [] });

    expect(events.find((event) => event.id === "flawless")).toMatchObject({ completionId: 4, awardedAt: "2026-03-02T20:00:00.000Z" });
  });

  it("counts an urgent task every time, reading urgency off the task", () => {
    const tasks = [task({ id: 7, priority: "urgent" })];
    const completions = [
      completion({ id: 1, taskId: 7, completedAt: "2026-03-01T10:00:00.000Z" }),
      completion({ id: 2, taskId: 7, completedAt: "2026-03-04T10:00:00.000Z" }),
    ];

    const events = achievementEvents({ memberId: 1, completions, tasks }).filter((event) => event.id === "urgentTask");

    expect(events.map((event) => event.completionId)).toEqual([1, 2]);
  });

  it("comes back oldest first, whatever order the completions arrive in", () => {
    const completions = [onDay(9), onDay(2), onDay(5)];

    const events = achievementEvents({ memberId: 1, completions, tasks: [] });

    expect(events.map((event) => event.awardedAt)).toEqual([...events.map((event) => event.awardedAt)].sort());
  });

  it("marks as repeatable only the badges that can happen again", () => {
    const achievements = memberAchievements({ memberId: 1, completions: [], tasks: [] });
    const repeatable = achievements.filter((achievement) => achievement.repeatable).map((achievement) => achievement.id);

    expect(repeatable).toEqual(["flawless", "urgentTask", "bigTask"]);
    expect(isRepeatable("bigTask")).toBe(true);
    expect(isRepeatable("tenTasks")).toBe(false);
  });
});
