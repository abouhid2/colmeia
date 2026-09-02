import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CROWN_TITLE } from "../domain/crownTitles";
import { LIMITS } from "../domain/limits";
import { EXAMPLE_HOUSEHOLD_NAME } from "./localState";
import { DEMO_INVITE_CODE, LocalApi, type KeyValueStore } from "./localApi";
import { HOUSEHOLD_INDEX_KEY, HOUSEHOLD_KEY_PREFIX } from "./localStore";
import { buildDemoState } from "./seed";

class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const now = new Date(2026, 2, 11, 15);

function buildApi(store: KeyValueStore = new MemoryStore(), codes = [ "codigo0001", "codigo0002" ]) {
  let issued = 0;
  return new LocalApi(store, {
    seed: () => buildDemoState(now),
    clock: () => now,
    newCode: () => codes[Math.min(issued++, codes.length - 1)],
  });
}

describe("LocalApi households", () => {
  let api: LocalApi;

  beforeEach(() => {
    api = buildApi();
  });

  it("opens every new colmeia with a first estação", async () => {
    const created = await api.households.create({ name: "Casa nova", memberNames: [] });
    api.setInviteCode(created.inviteCode);

    expect((await api.seasons.list()).map((season) => [ season.name, season.startsOn, season.endsOn ])).toEqual([
      [ "Primeira estação", "2026-03-11", null ],
    ]);
  });

  it("creates a colmeia with placeholder members nobody has claimed", async () => {
    const household = await api.households.create({ name: "  Família Silva  ", memberNames: [ "Ana", " Bruno ", "", "   " ] });

    expect(household).toMatchObject({ name: "Família Silva", inviteCode: "codigo0001" });
    expect(household.members.map((member) => member.name)).toEqual([ "Ana", "Bruno" ]);
    expect(household.members.every((member) => member.claimedAt === null)).toBe(true);
    expect(household.members.map((member) => member.color)).toEqual([ "honey", "pollen" ]);
  });

  it("refuses a colmeia with no name", async () => {
    await expect(api.households.create({ name: "   ", memberNames: [] })).rejects.toMatchObject({ status: 422 });
  });

  it("holds names to the same lengths the API does", async () => {
    await expect(api.households.create({ name: "x".repeat(LIMITS.householdName + 1), memberNames: [] }))
      .rejects.toMatchObject({ status: 422 });
    await expect(api.households.create({ name: "Casa", memberNames: [ "x".repeat(LIMITS.memberName + 1) ] }))
      .rejects.toMatchObject({ status: 422 });
    const created = await api.households.create({ name: "Casa", memberNames: [] });
    await expect(api.households.join(created.inviteCode, { name: "x".repeat(LIMITS.memberName + 1), avatar: "🐝", color: "honey", crownTitle: DEFAULT_CROWN_TITLE }))
      .rejects.toMatchObject({ status: 422 });
  });

  it("refuses a list longer than a colmeia starts with", async () => {
    const names = Array.from({ length: LIMITS.initialMembers + 1 }, (_, index) => `Pessoa ${index}`);

    await expect(api.households.create({ name: "Multidão", memberNames: names })).rejects.toMatchObject({ status: 422 });
    expect((await api.listStoredHouseholds()).map((item) => item.name)).not.toContain("Multidão");
  });

  it("stops taking people once the colmeia is full", async () => {
    const names = Array.from({ length: LIMITS.initialMembers }, (_, index) => `Pessoa ${index}`);
    const created = await api.households.create({ name: "Casa cheia", memberNames: names });
    api.setInviteCode(created.inviteCode);
    for (let seat = LIMITS.initialMembers; seat < LIMITS.householdMembers; seat += 1) {
      await api.members.create({ name: `Pessoa ${seat}`, avatar: "🐝", color: "honey", crownTitle: DEFAULT_CROWN_TITLE });
    }

    await expect(api.members.create({ name: "Mais uma", avatar: "🐝", color: "honey", crownTitle: DEFAULT_CROWN_TITLE })).rejects.toMatchObject({ status: 422 });
    await expect(api.households.join(created.inviteCode, { name: "Mais uma", avatar: "🐝", color: "honey", crownTitle: DEFAULT_CROWN_TITLE }))
      .rejects.toMatchObject({ status: 422 });
    expect((await api.members.list())).toHaveLength(LIMITS.householdMembers);
  });

  it("looks a colmeia up by its invite code and 404s on anything else", async () => {
    const created = await api.households.create({ name: "Casa", memberNames: [ "Ana" ] });

    const found = await api.households.lookup(created.inviteCode);
    expect(found).toMatchObject({ name: "Casa" });
    expect(found.members.map((member) => member.name)).toEqual([ "Ana" ]);

    await expect(api.households.lookup("naoexiste")).rejects.toMatchObject({ status: 404 });
  });

  it("answers to a code however it was typed", async () => {
    const created = await api.households.create({ name: "Casa", memberNames: [ "Ana" ] });

    expect((await api.households.lookup(created.inviteCode.toUpperCase())).name).toBe("Casa");
  });

  it("still finds a colmeia this browser filed under a mixed-case code", async () => {
    const store = new MemoryStore();
    const legacy = buildApi(store);
    const created = await legacy.households.create({ name: "Casa antiga", memberNames: [] });
    const state = store.getItem(`${HOUSEHOLD_KEY_PREFIX}${created.inviteCode}`) ?? "";
    const index = JSON.parse(store.getItem(HOUSEHOLD_INDEX_KEY) ?? "{}") as Record<string, unknown>;
    // Codes used to be drawn with capitals in them, and that is all this
    // browser has: the lowercase key is gone.
    store.removeItem(`${HOUSEHOLD_KEY_PREFIX}${created.inviteCode}`);
    store.setItem(`${HOUSEHOLD_KEY_PREFIX}CodiGO0001`, state);
    store.setItem(HOUSEHOLD_INDEX_KEY, JSON.stringify({ CodiGO0001: index[created.inviteCode] }));

    expect((await legacy.households.lookup("codigo0001")).name).toBe("Casa antiga");
  });

  it("claims a placeholder once and refuses the second time", async () => {
    const created = await api.households.create({ name: "Casa", memberNames: [ "Ana" ] });
    const [ ana ] = created.members;

    const claimed = await api.households.claim(created.inviteCode, ana.id);
    expect(claimed.claimedAt).toBe(now.toISOString());

    await expect(api.households.claim(created.inviteCode, ana.id)).rejects.toMatchObject({ status: 409 });

    const reread = await api.households.lookup(created.inviteCode);
    expect(reread.members[0].claimedAt).toBe(now.toISOString());
  });

  it("lets someone the list did not have join, already claimed", async () => {
    const created = await api.households.create({ name: "Casa", memberNames: [ "Ana" ] });

    const duda = await api.households.join(created.inviteCode, { name: " Duda ", avatar: "🦉", color: "leaf", crownTitle: "Abelhão" });

    expect(duda).toMatchObject({ name: "Duda", avatar: "🦉", color: "leaf", crownTitle: "Abelhão" });
    expect(duda.claimedAt).toBe(now.toISOString());
    expect((await api.households.lookup(created.inviteCode)).members).toHaveLength(2);
  });

  it("keeps colmeias apart and refuses scoped calls without one" , async () => {
    const first = await api.households.create({ name: "Primeira", memberNames: [ "Ana" ] });
    const second = await api.households.create({ name: "Segunda", memberNames: [ "Bruno" ] });

    await expect(api.members.list()).rejects.toMatchObject({ status: 401 });

    api.setInviteCode(first.inviteCode);
    const [ firstSeason ] = await api.seasons.list();
    await api.tasks.create({
      seasonId: firstSeason.id, title: "Louça", description: null, points: 5, priority: "low", recurrence: "none", intervalDays: null,
      dueOn: null, requiresReview: false, kidFriendly: false, assigneeId: null, createdById: null,
    });
    expect((await api.members.list()).map((member) => member.name)).toEqual([ "Ana" ]);

    api.setInviteCode(second.inviteCode);
    expect((await api.members.list()).map((member) => member.name)).toEqual([ "Bruno" ]);
    expect(await api.tasks.list(null)).toEqual([]);
    // Each colmeia keeps its own estações, and its own count of them.
    expect((await api.seasons.list()).map((season) => season.tasksCount)).toEqual([ 0 ]);
    expect(firstSeason.tasksCount).toBe(0);
  });

  it("lists the colmeias this browser holds, saying which are examples", async () => {
    await api.households.create({ name: "Casa nova", memberNames: [] });
    await api.households.createDemo();

    const stored = await api.listStoredHouseholds();

    expect(stored.map((item) => [ item.inviteCode, item.demo ])).toEqual([
      [ "codigo0001", false ],
      [ "codigo0002", true ],
    ]);
    expect(stored.find((item) => item.demo)?.name).toBe(EXAMPLE_HOUSEHOLD_NAME);
  });

  it("migrates the old single-colmeia store into the demo colmeia" , async () => {
    const store = new MemoryStore();
    const { household: _dropped, members, ...rest } = buildDemoState(now);
    // v2 had no invite code and no claimedAt: one colmeia, everybody in it.
    store.setItem("colmeia.db.v2", JSON.stringify({
      ...rest,
      household: { id: 1, name: "Casa antiga" },
      members: members.map(({ claimedAt: _unclaimed, ...member }) => member),
    }));

    const migrated = buildApi(store);
    const household = await migrated.households.lookup(DEMO_INVITE_CODE);

    // Real data from an older version, not an example: it must never be flagged.
    expect(household).toMatchObject({ name: "Casa antiga", inviteCode: DEMO_INVITE_CODE, demo: false });
    // v2 never knew who this browser was, so the list still has to be claimed.
    expect(household.members.every((member) => member.claimedAt === null)).toBe(true);
    expect(store.getItem("colmeia.db.v2")).toBeNull();
    expect(store.getItem(HOUSEHOLD_INDEX_KEY)).not.toBeNull();
  });

  it("rebuilds an index a browser left half written", async () => {
    const store = new MemoryStore();
    store.setItem(HOUSEHOLD_INDEX_KEY, "{\"demo\": ");

    const recovered = buildApi(store);
    const { household } = await recovered.households.createDemo();

    expect(household.name).toBe(EXAMPLE_HOUSEHOLD_NAME);
    expect(JSON.parse(store.getItem(HOUSEHOLD_INDEX_KEY) ?? "null")).toHaveProperty("codigo0001");
  });

  it("treats an unreadable colmeia as one this browser does not have", async () => {
    const store = new MemoryStore();
    const broken = buildApi(store);
    const created = await broken.households.create({ name: "Casa", memberNames: [] });
    store.setItem(`${HOUSEHOLD_KEY_PREFIX}${created.inviteCode}`, "}{");

    await expect(broken.households.lookup(created.inviteCode)).rejects.toMatchObject({ status: 404 });
  });

  it("fills in the lagartinha fields for a store written before they existed", async () => {
    const store = new MemoryStore();
    const state = buildDemoState(now);
    store.setItem(HOUSEHOLD_INDEX_KEY, JSON.stringify({ [DEMO_INVITE_CODE]: { name: "Casa", createdAt: now.toISOString() } }));
    store.setItem(`${HOUSEHOLD_KEY_PREFIX}${DEMO_INVITE_CODE}`, JSON.stringify({
      ...state,
      members: state.members.map(({ kind: _kind, pointsMultiplier: _multiplier, ...member }) => member),
      tasks: state.tasks.map(({ kidFriendly: _kidFriendly, ...task }) => task),
      completions: state.completions.map(({ multiplier: _multiplier, ...completion }) => completion),
    }));

    const older = buildApi(store);
    older.setInviteCode(DEMO_INVITE_CODE);

    expect((await older.members.list()).map((member) => [ member.kind, member.pointsMultiplier ]))
      .toEqual(state.members.map(() => [ "bee", 1 ]));
    expect((await older.tasks.list(null)).every((task) => task.kidFriendly === false)).toBe(true);
    expect((await older.completions.list()).every((completion) => completion.multiplier === 1)).toBe(true);
    // An index written before sandboxes existed holds real colmeias only.
    expect((await older.listStoredHouseholds()).map((item) => item.demo)).toEqual([ false ]);
  });

  it("leaves a brand-new browser with no colmeia at all", async () => {
    expect(await api.listStoredHouseholds()).toEqual([]);
    await expect(api.households.lookup(DEMO_INVITE_CODE)).rejects.toMatchObject({ status: 404 });
  });

  it("hands out an example colmeia of its own, with Ana already inside it", async () => {
    const { household, member } = await api.households.createDemo();

    expect(household).toMatchObject({ name: EXAMPLE_HOUSEHOLD_NAME, inviteCode: "codigo0001", demo: true });
    expect(household.members.map((person) => person.name)).toEqual([ "Ana", "Bruno", "Clara", "Duda" ]);
    expect(member).toMatchObject({ name: "Ana", claimedAt: now.toISOString() });
    expect(household.members.filter((person) => person.claimedAt !== null)).toHaveLength(1);

    api.setInviteCode(household.inviteCode);
    expect((await api.tasks.list(null)).length).toBeGreaterThan(0);
    expect((await api.goals.list(null)).length).toBeGreaterThan(0);
    expect(await api.household.get()).toMatchObject({ demo: true });
  });

  it("gives each visitor an example nobody else is mexing with", async () => {
    const first = await api.households.createDemo();
    const second = await api.households.createDemo();

    expect(first.household.inviteCode).not.toBe(second.household.inviteCode);

    api.setInviteCode(first.household.inviteCode);
    await api.tasks.remove(10);
    expect((await api.tasks.list(null)).some((task) => task.id === 10)).toBe(false);

    api.setInviteCode(second.household.inviteCode);
    expect((await api.tasks.list(null)).some((task) => task.id === 10)).toBe(true);
  });

  it("puts an example back the way it was handed out", async () => {
    const { household } = await api.households.createDemo();
    api.setInviteCode(household.inviteCode);
    await api.tasks.remove(10);
    await api.household.update({ name: "Estraguei tudo" });

    const member = await api.household.reseed();

    expect(member).toMatchObject({ name: "Ana", claimedAt: now.toISOString() });
    expect((await api.tasks.list(null)).some((task) => task.id === 10)).toBe(true);
    expect(await api.household.get()).toMatchObject({ name: EXAMPLE_HOUSEHOLD_NAME, inviteCode: household.inviteCode, demo: true });
  });

  it("refuses to reseed a colmeia somebody actually lives in", async () => {
    const created = await api.households.create({ name: "Casa", memberNames: [ "Ana" ] });
    api.setInviteCode(created.inviteCode);

    await expect(api.household.reseed()).rejects.toMatchObject({ status: 409 });
    expect((await api.members.list()).map((member) => member.name)).toEqual([ "Ana" ]);
  });
});
