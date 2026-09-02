import { beforeEach, describe, expect, it } from "vitest";
import { LIMITS } from "../domain/limits";
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
    await expect(api.households.join(DEMO_INVITE_CODE, { name: "x".repeat(LIMITS.memberName + 1), avatar: "🐝", color: "honey" }))
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
      await api.members.create({ name: `Pessoa ${seat}`, avatar: "🐝", color: "honey" });
    }

    await expect(api.members.create({ name: "Mais uma", avatar: "🐝", color: "honey" })).rejects.toMatchObject({ status: 422 });
    await expect(api.households.join(created.inviteCode, { name: "Mais uma", avatar: "🐝", color: "honey" }))
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

    const duda = await api.households.join(created.inviteCode, { name: " Duda ", avatar: "🦉", color: "leaf" });

    expect(duda).toMatchObject({ name: "Duda", avatar: "🦉", color: "leaf" });
    expect(duda.claimedAt).toBe(now.toISOString());
    expect((await api.households.lookup(created.inviteCode)).members).toHaveLength(2);
  });

  it("keeps colmeias apart and refuses scoped calls without one" , async () => {
    const first = await api.households.create({ name: "Primeira", memberNames: [ "Ana" ] });
    const second = await api.households.create({ name: "Segunda", memberNames: [ "Bruno" ] });

    await expect(api.members.list()).rejects.toMatchObject({ status: 401 });

    api.setInviteCode(first.inviteCode);
    await api.tasks.create({
      title: "Louça", description: null, points: 5, priority: "low", recurrence: "none", intervalDays: null,
      dueOn: null, requiresReview: false, assigneeId: null, createdById: null,
    });
    expect((await api.members.list()).map((member) => member.name)).toEqual([ "Ana" ]);

    api.setInviteCode(second.inviteCode);
    expect((await api.members.list()).map((member) => member.name)).toEqual([ "Bruno" ]);
    expect(await api.tasks.list()).toEqual([]);
  });

  it("lists the colmeias this browser holds, the demo included", async () => {
    await api.households.create({ name: "Casa nova", memberNames: [] });

    const stored = await api.listStoredHouseholds();

    expect(stored.map((item) => item.inviteCode).sort()).toEqual([ "codigo0001", DEMO_INVITE_CODE ].sort());
    expect(stored.find((item) => item.inviteCode === DEMO_INVITE_CODE)?.name).toBe("Família Colmeia");
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

    expect(household).toMatchObject({ name: "Casa antiga", inviteCode: DEMO_INVITE_CODE });
    // v2 never knew who this browser was, so the list still has to be claimed.
    expect(household.members.every((member) => member.claimedAt === null)).toBe(true);
    expect(store.getItem("colmeia.db.v2")).toBeNull();
    expect(store.getItem(HOUSEHOLD_INDEX_KEY)).not.toBeNull();
  });

  it("rebuilds an index a browser left half written", async () => {
    const store = new MemoryStore();
    store.setItem(HOUSEHOLD_INDEX_KEY, "{\"demo\": ");

    const recovered = buildApi(store);

    expect((await recovered.households.lookup(DEMO_INVITE_CODE)).name).toBe("Família Colmeia");
    expect(JSON.parse(store.getItem(HOUSEHOLD_INDEX_KEY) ?? "null")).toHaveProperty(DEMO_INVITE_CODE);
  });

  it("treats an unreadable colmeia as one this browser does not have", async () => {
    const store = new MemoryStore();
    const broken = buildApi(store);
    const created = await broken.households.create({ name: "Casa", memberNames: [] });
    store.setItem(`${HOUSEHOLD_KEY_PREFIX}${created.inviteCode}`, "}{");

    await expect(broken.households.lookup(created.inviteCode)).rejects.toMatchObject({ status: 404 });
  });

  it("seeds a fresh browser with the demo colmeia, nobody claimed" , async () => {
    const household = await api.households.lookup(DEMO_INVITE_CODE);

    expect(household.name).toBe("Família Colmeia");
    expect(household.members).toHaveLength(4);
    expect(household.members.every((member) => member.claimedAt === null)).toBe(true);
  });
});
