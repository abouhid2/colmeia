import { beforeEach, describe, expect, it } from "vitest";
import { LIMITS } from "../domain/limits";
import { ApiError } from "./errors";
import { DEMO_INVITE_CODE, LocalApi, type KeyValueStore } from "./localApi";
import { HOUSEHOLD_INDEX_KEY } from "./localStore";
import { buildDemoState } from "./seed";

/** The estação the demo runs in, and the one it already closed. */
const SEASON_ID = 71;
const PAST_SEASON_ID = 70;

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

    const created = await api.members.create({ name: "Tino", avatar: "🐢", color: "leaf", crownTitle: "Tartaruga-mor", kind: "lagartinha", pointsMultiplier: 2 });
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

    expect(await api.completions.list({ limit: 2 })).toEqual(everything.slice(0, 2));
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
    expect((await api.goals.list(SEASON_ID)).map((goal) => goal.title)).toEqual(["Pizza e filme no sábado", "Escolher o filme do sábado"]);
  });

  it("creates, edits and removes goals", async () => {
    const goal = await api.goals.create({ title: "Passeio", targetPoints: 100, seasonId: SEASON_ID, memberId: 1 });
    expect(goal.memberId).toBe(1);
    const edited = await api.goals.update(goal.id, { targetPoints: 120 });
    expect(edited.targetPoints).toBe(120);
    await api.goals.remove(goal.id);
    expect((await api.goals.list(SEASON_ID)).some((item) => item.id === goal.id)).toBe(false);
    await expect(api.goals.create({ title: "", targetPoints: 10, seasonId: SEASON_ID, memberId: null })).rejects.toMatchObject({ status: 422 });
  });

  it("migrates a v1 store into the goal list, inside a first estação", async () => {
    const store = new MemoryStore();
    store.setItem("colmeia.db.v1", JSON.stringify({ ...buildDemoState(now), seasons: undefined, goals: undefined, goal: { id: 9, title: "Antiga", targetPoints: 50, period: "week" } }));
    const migrated = new LocalApi(store, { seed: () => buildDemoState(now), clock: () => now });
    migrated.setInviteCode(DEMO_INVITE_CODE);

    const [ season ] = await migrated.seasons.list();
    expect(season.name).toBe("Primeira estação");
    expect(await migrated.goals.list(null)).toEqual([{ id: 9, title: "Antiga", targetPoints: 50, memberId: null, seasonId: season.id }]);
    expect(store.getItem("colmeia.db.v1")).toBeNull();
  });

  it("carries the colmeias of a v3 store over, each with a first estação", async () => {
    const store = new MemoryStore();
    const stored = buildDemoState(now);
    const { seasons: _seasons, ...seasonless } = stored;
    store.setItem("colmeia.households.v3", JSON.stringify({ [DEMO_INVITE_CODE]: { name: "Família Colmeia", createdAt: now.toISOString() } }));
    store.setItem(`colmeia.db.v3.${DEMO_INVITE_CODE}`, JSON.stringify({
      ...seasonless,
      tasks: stored.tasks.map(({ seasonId: _taskSeason, ...task }) => task),
      completions: stored.completions.map(({ seasonId: _completionSeason, ...completion }) => completion),
      goals: stored.goals.map(({ seasonId: _goalSeason, ...goal }) => ({ ...goal, period: "week" })),
    }));

    const migrated = new LocalApi(store, { seed: () => buildDemoState(now), clock: () => now });
    migrated.setInviteCode(DEMO_INVITE_CODE);

    const seasons = await migrated.seasons.list();
    expect(seasons.map((season) => season.name)).toEqual([ "Primeira estação" ]);
    // The oldest thing the colmeia holds, so nothing predates its own estação.
    expect(seasons[0].startsOn).toBe("2026-03-02");
    expect((await migrated.tasks.list(seasons[0].id))).toHaveLength(stored.tasks.length);
    expect((await migrated.goals.list(seasons[0].id))).toHaveLength(stored.goals.length);
    expect(store.getItem("colmeia.households.v3")).toBeNull();
    expect(store.getItem(`colmeia.db.v3.${DEMO_INVITE_CODE}`)).toBeNull();
    expect(store.getItem(HOUSEHOLD_INDEX_KEY)).not.toBeNull();
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
      seasonId: SEASON_ID, title: "Regar", description: null, points: 5, priority: "low", recurrence: "custom", intervalDays: null,
      dueOn: null, requiresReview: false, kidFriendly: false, assigneeId: null, createdById: null,
    })).rejects.toMatchObject({ status: 422 });
  });

  describe("estações", () => {
    const openTask = (seasonId: number) => api.tasks.create({
      seasonId, title: "Louça", description: null, points: 5, priority: "low", recurrence: "none", intervalDays: null,
      dueOn: null, requiresReview: false, kidFriendly: false, assigneeId: null, createdById: null,
    });

    it("lists them newest first, with what each one holds", async () => {
      const seasons = await api.seasons.list();

      expect(seasons.map((season) => season.name)).toEqual([ "Estação atual", "Estação passada" ]);
      expect(seasons[0]).toMatchObject({ tasksCount: 12, completionsCount: 6, closedAt: null, endsOn: null });
      expect(seasons[1]).toMatchObject({ tasksCount: 0, completionsCount: 10 });
    });

    it("keeps tasks, goals and completions inside their own estação", async () => {
      expect((await api.tasks.list(PAST_SEASON_ID))).toEqual([]);
      expect((await api.tasks.list(SEASON_ID))).toHaveLength(12);
      expect((await api.tasks.list(null))).toHaveLength(12);
      expect((await api.goals.list(PAST_SEASON_ID)).map((goal) => goal.title)).toEqual([ "Pizza e filme no sábado" ]);
      expect((await api.completions.list({ seasonId: PAST_SEASON_ID }))).toHaveLength(10);
      expect((await api.completions.list())).toHaveLength(16);
    });

    it("opens one, reusing the open tasks of another without their history", async () => {
      const season = await api.seasons.create({ name: "  Nova  ", startsOn: "2026-04-01", endsOn: null, copyTasksFromSeasonId: SEASON_ID });

      expect(season).toMatchObject({ name: "Nova", startsOn: "2026-04-01", endsOn: null, closedAt: null });
      const copied = await api.tasks.list(season.id);
      // Only the nine open ones travel; the three already done stay behind.
      expect(copied).toHaveLength(9);
      expect(copied.every((task) => task.status === "open" && task.dueOn === null && task.completedAt === null)).toBe(true);
      expect(copied.map((task) => task.title)).toContain("Limpar o banheiro");
      expect(await api.completions.list({ seasonId: season.id })).toEqual([]);
    });

    it("refuses an estação with no name or with the end before the start", async () => {
      await expect(api.seasons.create({ name: "  ", startsOn: "2026-04-01", endsOn: null })).rejects.toMatchObject({ status: 422 });
      await expect(api.seasons.create({ name: "Invertida", startsOn: "2026-04-01", endsOn: "2026-03-01" })).rejects.toMatchObject({ status: 422 });
    });

    it("closes once, reopens once, and scores nothing while closed", async () => {
      const closed = await api.seasons.close(SEASON_ID);
      expect(closed.closedAt).toBe(now.toISOString());
      await expect(api.seasons.close(SEASON_ID)).rejects.toMatchObject({ status: 409 });

      await expect(openTask(SEASON_ID)).rejects.toMatchObject({ status: 409 });
      await expect(api.goals.create({ title: "Tarde demais", targetPoints: 10, seasonId: SEASON_ID, memberId: null })).rejects.toMatchObject({ status: 409 });
      await expect(api.tasks.complete(13, 2)).rejects.toMatchObject({ status: 409 });

      const reopened = await api.seasons.reopen(SEASON_ID);
      expect(reopened.closedAt).toBeNull();
      await expect(api.seasons.reopen(SEASON_ID)).rejects.toMatchObject({ status: 409 });
      await expect(openTask(SEASON_ID)).resolves.toMatchObject({ status: "open" });
    });

    it("keeps an estação that already has history and deletes one that has none", async () => {
      await expect(api.seasons.remove(SEASON_ID)).rejects.toMatchObject({ status: 409 });

      const empty = await api.seasons.create({ name: "Vazia", startsOn: "2026-04-01", endsOn: null, copyTasksFromSeasonId: SEASON_ID });
      await api.seasons.remove(empty.id);

      expect((await api.seasons.list()).map((season) => season.id)).toEqual([ SEASON_ID, PAST_SEASON_ID ]);
      expect(await api.tasks.list(empty.id)).toEqual([]);
    });

    it("stamps the estação of the task on the completion it creates", async () => {
      const { completion } = await api.tasks.complete(13, 2);

      expect(completion.seasonId).toBe(SEASON_ID);
    });

    it("renames an estação and moves its dates", async () => {
      const renamed = await api.seasons.update(SEASON_ID, { name: "  Outono  ", endsOn: "2026-12-31" });

      expect(renamed).toMatchObject({ name: "Outono", endsOn: "2026-12-31" });
    });
  });
});
