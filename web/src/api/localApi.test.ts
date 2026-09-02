import { beforeEach, describe, expect, it } from "vitest";
import { LIMITS } from "../domain/limits";
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

  beforeEach(async () => {
    // The example colmeia is the one somebody asked for, under a known code.
    api = new LocalApi(new MemoryStore(), {
      seed: () => buildDemoState(now), clock: () => now, newCode: () => DEMO_INVITE_CODE,
    });
    await api.households.createDemo();
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

    const created = await api.members.create({ name: "Tino", avatar: "🐢", color: "leaf", crownTitle: "Tartaruga-mor", kind: "lagartinha", pointsMultiplier: 2 });
    expect(created.pointsMultiplier).toBe(2);
  });

  it("refuses a multiplier outside the sane range", async () => {
    await expect(api.members.update(4, { pointsMultiplier: 9 })).rejects.toMatchObject({ status: 422 });
  });

  it("refuses to complete a finished task", async () => {
    await expect(api.tasks.complete(19, 1)).rejects.toMatchObject({ status: 409 });
  });

  describe("a completion registered after the fact", () => {
    const twoDaysAgo = new Date(2026, 2, 9, 18, 30);

    it("closes a one-off task on the day the work happened, not today", async () => {
      const { task, completion } = await api.tasks.complete(13, 2, { completedAt: twoDaysAgo.toISOString() });

      expect(completion.completedAt).toBe(twoDaysAgo.toISOString());
      expect(task.completedAt).toBe(twoDaysAgo.toISOString());
      expect(task.status).toBe("done");
    });

    it("rolls a recurring task forward from the day the work happened", async () => {
      const { task } = await api.tasks.complete(16, 1, { completedAt: twoDaysAgo.toISOString() });

      expect(task.dueOn).toBe("2026-03-16");
    });

    it("keeps the due date when the completion belongs to a cycle already closed", async () => {
      const { task } = await api.tasks.complete(16, 1, { completedAt: new Date(2026, 1, 1, 10).toISOString() });

      expect(task.dueOn).toBe("2026-03-13");
    });

    it("leaves a reviewed task pending, dated when the work happened", async () => {
      const { completion } = await api.tasks.complete(10, 3, { completedAt: twoDaysAgo.toISOString() });

      expect(completion).toMatchObject({ status: "pending", pointsAwarded: 0 });
      expect(completion.completedAt).toBe(twoDaysAgo.toISOString());
    });

    it("refuses a moment in the future", async () => {
      await expect(api.tasks.complete(13, 2, { completedAt: new Date(2026, 2, 12, 9).toISOString() }))
        .rejects.toMatchObject({ status: 422, details: [ "Essa data está no futuro" ] });
    });

    it("tolerates a clock a minute ahead of the server's", async () => {
      const ahead = new Date(2026, 2, 11, 15, 1);
      const { completion } = await api.tasks.complete(13, 2, { completedAt: ahead.toISOString() });

      expect(completion.completedAt).toBe(ahead.toISOString());
    });

    it("refuses a moment more than a year back", async () => {
      await expect(api.tasks.complete(13, 2, { completedAt: new Date(2025, 0, 1, 10).toISOString() }))
        .rejects.toMatchObject({ status: 422, details: [ "Só dá para registrar até um ano atrás" ] });
    });

    it("accepts a moment exactly a year back", async () => {
      const aYearBack = new Date(2025, 2, 11, 15);
      const { completion } = await api.tasks.complete(13, 2, { completedAt: aYearBack.toISOString() });

      expect(completion.completedAt).toBe(aYearBack.toISOString());
    });

    it("refuses a moment it cannot read", async () => {
      await expect(api.tasks.complete(13, 2, { completedAt: "ontem à noite" }))
        .rejects.toMatchObject({ status: 422, details: [ "Não deu para entender essa data" ] });
    });

    it("counts as done now when no moment comes with it", async () => {
      const { completion } = await api.tasks.complete(13, 2, {});

      expect(completion.completedAt).toBe(now.toISOString());
    });
  });

  it("reopens a finished task and clears its completion date", async () => {
    const reopened = await api.tasks.reopen(19);
    expect(reopened).toMatchObject({ status: "open", completedAt: null });
    await expect(api.tasks.reopen(19)).rejects.toMatchObject({ status: 409 });
  });

  it("takes back the completion that closed the task it reopens", async () => {
    await api.tasks.reopen(19);

    expect((await api.completions.list()).some((completion) => completion.id === 30)).toBe(false);
  });

  it("pays a reopened task once, not once per time it was finished", async () => {
    const { completion: first } = await api.tasks.complete(13, 2);

    await api.tasks.reopen(13);
    const { completion: second } = await api.tasks.complete(13, 2);

    const paid = (await api.completions.list()).filter((completion) => completion.taskId === 13);
    expect(paid.map((completion) => completion.id)).toEqual([ second.id ]);
    expect(paid[0].id).not.toBe(first.id);
    expect(paid[0].pointsAwarded).toBe(15);
  });

  it("keeps the completions of the times before the one it undoes", async () => {
    await api.tasks.complete(12, 1);
    const { completion: newest } = await api.tasks.complete(13, 1);
    await api.tasks.reopen(13);

    expect((await api.completions.list()).some((completion) => completion.id === newest.id)).toBe(false);
    expect((await api.completions.list()).some((completion) => completion.taskId === 12)).toBe(true);
  });

  it("answers the history in the slice it is asked for" , async () => {
    const everything = await api.completions.list();

    expect(await api.completions.list(2)).toEqual(everything.slice(0, 2));
    expect(everything.length).toBeGreaterThan(2);
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

  it("reads members stored before crown titles existed with the default title", async () => {
    const store = new MemoryStore();
    const stored = buildDemoState(now);
    const bare = stored.members.map(({ crownTitle: _crownTitle, ...member }) => member);
    store.setItem("colmeia.db.v2", JSON.stringify({ ...stored, members: bare }));

    const upgraded = new LocalApi(store, { seed: () => buildDemoState(now), clock: () => now });
    upgraded.setInviteCode(DEMO_INVITE_CODE);

    expect((await upgraded.members.list()).map((member) => member.crownTitle)).toEqual(
      ["Abelha Rainha", "Abelha Rainha", "Abelha Rainha", "Abelha Rainha"],
    );
  });

  it("keeps the crown title a member chose, trimmed", async () => {
    expect((await api.members.list()).find((member) => member.id === 2)?.crownTitle).toBe("Abelhão");

    const changed = await api.members.update(2, { crownTitle: "  Rei da Louça  " });
    expect(changed.crownTitle).toBe("Rei da Louça");
  });

  it("takes a blank crown title as opting out of the crown", async () => {
    const changed = await api.members.update(2, { crownTitle: "   " });

    expect(changed.crownTitle).toBe("");
  });

  it("refuses a crown title too long to sit next to a name", async () => {
    await expect(api.members.update(2, { crownTitle: "a".repeat(31) })).rejects.toMatchObject({ status: 422 });
    await expect(
      api.members.create({ name: "Novo", avatar: "🐝", color: "honey", crownTitle: "a".repeat(31) }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("writes badges down once, however many times they are sent", async () => {
    const rows = [
      { key: "firstTask" as const, completionId: 34, awardedAt: "2026-03-01T10:00:00.000Z" },
      { key: "bigTask" as const, completionId: 62, awardedAt: "2026-03-02T10:00:00.000Z" },
    ];

    await api.achievementAwards.record(1, rows);
    await api.achievementAwards.record(1, [ ...rows, { key: "bigTask" as const, completionId: 63, awardedAt: "2026-03-03T10:00:00.000Z" } ]);

    const stored = await api.achievementAwards.list(1);
    expect(stored.map((award) => [ award.key, award.completionId ])).toEqual([
      [ "firstTask", 34 ], [ "bigTask", 62 ], [ "bigTask", 63 ],
    ]);
    expect(stored.every((award) => award.memberId === 1)).toBe(true);
  });

  it("keeps a badge after the completion that earned it is deleted", async () => {
    await api.achievementAwards.record(1, [ { key: "bigTask", completionId: 62, awardedAt: "2026-03-02T10:00:00.000Z" } ]);

    await api.tasks.remove(19);

    expect((await api.achievementAwards.list(1)).map((award) => award.completionId)).toEqual([ 62 ]);
  });

  it("refuses a badge nobody has heard of, and someone who is not here", async () => {
    await expect(
      api.achievementAwards.record(1, [ { key: "melhorDaCasa" as never, completionId: null, awardedAt: "2026-03-01T10:00:00.000Z" } ]),
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      api.achievementAwards.record(999, [ { key: "firstTask", completionId: null, awardedAt: "2026-03-01T10:00:00.000Z" } ]),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("takes the badges of whoever leaves the colmeia", async () => {
    await api.achievementAwards.record(1, [ { key: "firstTask", completionId: 34, awardedAt: "2026-03-01T10:00:00.000Z" } ]);
    await api.achievementAwards.record(2, [ { key: "flawless", completionId: 60, awardedAt: "2026-03-01T10:00:00.000Z" } ]);

    await api.members.remove(1);

    expect((await api.achievementAwards.list(null)).map((award) => award.memberId)).toEqual([ 2 ]);
  });

  it("pins up to three badges, and only ones that exist", async () => {
    const pinned = await api.members.update(3, { favoriteAchievements: [ "firstTask", "sevenDays" ] });
    expect(pinned.favoriteAchievements).toEqual([ "firstTask", "sevenDays" ]);

    await expect(api.members.update(3, { favoriteAchievements: [ "firstTask", "firstTask" ] })).rejects.toMatchObject({ status: 422 });
    await expect(api.members.update(3, { favoriteAchievements: [ "melhorDaCasa" as never ] })).rejects.toMatchObject({ status: 422 });
    await expect(
      api.members.update(3, { favoriteAchievements: [ "firstTask", "sevenDays", "bigTask", "flawless" ] }),
    ).rejects.toMatchObject({ status: 422 });
    expect((await api.members.list()).find((member) => member.id === 3)?.favoriteAchievements).toEqual([ "firstTask", "sevenDays" ]);
  });

  it("reads a store written before badges were kept as an empty shelf", async () => {
    const store = new MemoryStore();
    const stored = buildDemoState(now);
    const bare = stored.members.map(({ favoriteAchievements: _favorites, ...member }) => member);
    store.setItem("colmeia.db.v2", JSON.stringify({ ...stored, members: bare, awards: undefined }));

    const upgraded = new LocalApi(store, { seed: () => buildDemoState(now), clock: () => now });
    upgraded.setInviteCode(DEMO_INVITE_CODE);

    expect(await upgraded.achievementAwards.list(null)).toEqual([]);
    expect((await upgraded.members.list()).every((member) => member.favoriteAchievements.length === 0)).toBe(true);
  });

  it("stamps purchases and clears bought items", async () => {
    const bought = await api.shopping.update(40, { purchased: true, purchasedById: 2 });
    expect(bought.purchasedAt).toBe(now.toISOString());
    await api.shopping.clearPurchased();
    expect((await api.shopping.list()).every((item) => !item.purchased)).toBe(true);
  });

  it("holds an edited shopping item to the same lengths as a new one", async () => {
    await expect(api.shopping.update(40, { name: "x".repeat(LIMITS.shoppingItemName + 1) })).rejects.toMatchObject({ status: 422 });
    await expect(api.shopping.update(40, { name: "   " })).rejects.toMatchObject({ status: 422 });
    await expect(api.shopping.update(40, { quantity: "x".repeat(LIMITS.shoppingQuantity + 1) })).rejects.toMatchObject({ status: 422 });
    expect((await api.shopping.list()).find((item) => item.id === 40)?.name).toBe("Leite");
  });

  it("validates task input", async () => {
    await expect(api.tasks.create({
      title: "Regar", description: null, points: 5, priority: "low", recurrence: "custom", intervalDays: null,
      dueOn: null, requiresReview: false, kidFriendly: false, assigneeId: null, createdById: null,
    })).rejects.toMatchObject({ status: 422 });
  });
});
