import { describe, expect, it } from "vitest";
import { memberAchievements, type AchievementId } from "./achievements";
import type { Completion, Task } from "./types";

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-11T10:00:00.000Z", reviewedAt: null, ...overrides,
});

const task = (overrides: Partial<Task>): Task => ({
  id: 1, title: "x", description: null, points: 10, priority: "medium", recurrence: "none", intervalDays: null,
  dueOn: null, requiresReview: false, kidFriendly: false, status: "open", completedAt: null, assigneeId: null, createdById: null,
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
