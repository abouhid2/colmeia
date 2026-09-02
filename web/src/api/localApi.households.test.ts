import { beforeEach, describe, expect, it } from "vitest";
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

  it("looks a colmeia up by its invite code and 404s on anything else", async () => {
    const created = await api.households.create({ name: "Casa", memberNames: [ "Ana" ] });

    const found = await api.households.lookup(created.inviteCode);
    expect(found).toMatchObject({ name: "Casa" });
    expect(found.members.map((member) => member.name)).toEqual([ "Ana" ]);

    await expect(api.households.lookup("naoexiste")).rejects.toMatchObject({ status: 404 });
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
    await api.tasks.create({
      title: "Louça", description: null, points: 5, priority: "low", recurrence: "none", intervalDays: null,
      dueOn: null, requiresReview: false, kidFriendly: false, assigneeId: null, createdById: null,
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
    // People already using the app are in it, so nobody has to claim a place.
    expect(household.members.every((member) => member.claimedAt !== null)).toBe(true);
    expect(store.getItem("colmeia.db.v2")).toBeNull();
    expect(store.getItem(HOUSEHOLD_INDEX_KEY)).not.toBeNull();
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
    expect((await older.tasks.list()).every((task) => task.kidFriendly === false)).toBe(true);
    expect((await older.completions.list()).every((completion) => completion.multiplier === 1)).toBe(true);
  });

  it("seeds a fresh browser with the demo colmeia, nobody claimed" , async () => {
    const household = await api.households.lookup(DEMO_INVITE_CODE);

    expect(household.name).toBe("Família Colmeia");
    expect(household.members).toHaveLength(4);
    expect(household.members.every((member) => member.claimedAt === null)).toBe(true);
  });
});
