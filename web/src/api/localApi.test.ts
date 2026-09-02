import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "./errors";
import { DEMO_INVITE_CODE, LocalApi, type KeyValueStore } from "./localApi";
import { buildDemoState } from "./seed";

class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const now = new Date(2026, 2, 11, 15);

describe("LocalApi", () => {
  let api: LocalApi;

  beforeEach(() => {
    api = new LocalApi(new MemoryStore(), { seed: () => buildDemoState(now), clock: () => now });
    api.setInviteCode(DEMO_INVITE_CODE);
  });

  it("closes one-off tasks and pays out right away", async () => {
    const { task, completion } = await api.tasks.complete(13, 2);
    expect(task.status).toBe("done");
    expect(completion).toMatchObject({ status: "approved", pointsAwarded: 15, memberId: 2 });
  });

  it("rolls recurring tasks forward from today", async () => {
    const { task } = await api.tasks.complete(16, 1);
    expect(task.status).toBe("open");
    expect(task.dueOn).toBe("2026-03-18");
  });

  it("holds points until someone else rates a reviewed task", async () => {
    const { completion } = await api.tasks.complete(10, 3);
    expect(completion).toMatchObject({ status: "pending", pointsAwarded: 0 });

    await expect(api.completions.review(completion.id, { reviewerId: 3, rating: 5 })).rejects.toBeInstanceOf(ApiError);

    const reviewed = await api.completions.review(completion.id, { reviewerId: 1, rating: 3 });
    expect(reviewed).toMatchObject({ status: "approved", rating: 3, pointsAwarded: 30, reviewerId: 1 });
  });

  it("multiplies what a lagartinha earns and records the multiplier used", async () => {
    const { completion } = await api.tasks.complete(12, 4);

    expect(completion).toMatchObject({ pointsAwarded: 8, taskPoints: 5, multiplier: 1.5 });
  });

  it("pays a review with the multiplier the work was done under", async () => {
    const { completion } = await api.tasks.complete(17, 4);
    expect(completion).toMatchObject({ status: "pending", multiplier: 1.5 });

    await api.members.update(4, { pointsMultiplier: 3 });
    const reviewed = await api.completions.review(completion.id, { reviewerId: 1, rating: 4 });

    expect(reviewed.pointsAwarded).toBe(12);
  });

  it("hands a new lagartinha the default handicap and keeps a chosen one", async () => {
    const promoted = await api.members.update(2, { kind: "lagartinha" });
    expect(promoted).toMatchObject({ kind: "lagartinha", pointsMultiplier: 1.5 });

    const demoted = await api.members.update(2, { kind: "bee" });
    expect(demoted.pointsMultiplier).toBe(1.5);

    const created = await api.members.create({ name: "Tino", avatar: "🐢", color: "leaf", kind: "lagartinha", pointsMultiplier: 2 });
    expect(created.pointsMultiplier).toBe(2);
  });

  it("refuses a multiplier outside the sane range", async () => {
    await expect(api.members.update(4, { pointsMultiplier: 9 })).rejects.toMatchObject({ status: 422 });
  });

  it("refuses to complete a finished task", async () => {
    await expect(api.tasks.complete(19, 1)).rejects.toMatchObject({ status: 409 });
  });

  it("reopens a finished task and clears its completion date", async () => {
    const reopened = await api.tasks.reopen(19);
    expect(reopened).toMatchObject({ status: "open", completedAt: null });
    await expect(api.tasks.reopen(19)).rejects.toMatchObject({ status: 409 });
  });

  it("keeps completions when a member leaves", async () => {
    await api.members.remove(1);
    const completions = await api.completions.list();
    expect(completions.find((completion) => completion.id === 30)?.memberId).toBeNull();
    expect((await api.members.list()).map((member) => member.id)).toEqual([2, 3, 4]);
  });

  it("drops personal goals with their owner but keeps household ones", async () => {
    await api.members.remove(4);
    expect((await api.goals.list()).map((goal) => goal.title)).toEqual(["Pizza e filme no sábado", "Escolher o filme do sábado"]);
  });

  it("creates, edits and removes goals", async () => {
    const goal = await api.goals.create({ title: "Passeio", targetPoints: 100, period: "month", memberId: 1 });
    expect(goal.memberId).toBe(1);
    const edited = await api.goals.update(goal.id, { targetPoints: 120 });
    expect(edited.targetPoints).toBe(120);
    await api.goals.remove(goal.id);
    expect((await api.goals.list()).some((item) => item.id === goal.id)).toBe(false);
    await expect(api.goals.create({ title: "", targetPoints: 10, period: "week", memberId: null })).rejects.toMatchObject({ status: 422 });
  });

  it("migrates a v1 store into the goal list", async () => {
    const store = new MemoryStore();
    store.setItem("colmeia.db.v1", JSON.stringify({ ...buildDemoState(now), goals: undefined, goal: { id: 9, title: "Antiga", targetPoints: 50, period: "week" } }));
    const migrated = new LocalApi(store, { seed: () => buildDemoState(now), clock: () => now });
    migrated.setInviteCode(DEMO_INVITE_CODE);
    expect(await migrated.goals.list()).toEqual([{ id: 9, title: "Antiga", targetPoints: 50, period: "week", memberId: null }]);
    expect(store.getItem("colmeia.db.v1")).toBeNull();
  });

  it("stamps purchases and clears bought items", async () => {
    const bought = await api.shopping.update(40, { purchased: true, purchasedById: 2 });
    expect(bought.purchasedAt).toBe(now.toISOString());
    await api.shopping.clearPurchased();
    expect((await api.shopping.list()).every((item) => !item.purchased)).toBe(true);
  });

  it("validates task input", async () => {
    await expect(api.tasks.create({
      title: "Regar", description: null, points: 5, priority: "low", recurrence: "custom", intervalDays: null,
      dueOn: null, requiresReview: false, kidFriendly: false, assigneeId: null, createdById: null,
    })).rejects.toMatchObject({ status: 422 });
  });
});
