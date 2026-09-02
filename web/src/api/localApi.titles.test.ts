import { beforeEach, describe, expect, it } from "vitest";
import { LIMITS } from "../domain/limits";
import { DEMO_INVITE_CODE, LocalApi, type KeyValueStore } from "./localApi";
import { HOUSEHOLD_INDEX_KEY, HOUSEHOLD_KEY_PREFIX } from "./localStore";
import { buildDemoState } from "./seed";

/** The estação the demo closed, and the one still running. */
const PAST_SEASON_ID = 70;
const SEASON_ID = 71;
/** Ana, Bruno, Clara and Duda, in the order the example lists them. */
const [ ANA, BRUNO, CLARA ] = [ 1, 2, 3 ];

class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const now = new Date(2026, 2, 11, 15);

describe("LocalApi season titles", () => {
  let api: LocalApi;

  beforeEach(async () => {
    api = new LocalApi(new MemoryStore(), {
      seed: () => buildDemoState(now), clock: () => now, newCode: () => DEMO_INVITE_CODE,
    });
    await api.households.createDemo();
    api.setInviteCode(DEMO_INVITE_CODE);
  });

  const named = async (name: string) => {
    const titles = await api.seasonTitles.list();
    const found = titles.find((title) => title.name === name);
    if (!found) throw new Error(`the colmeia needs the title ${name}`);
    return found;
  };

  it("opens the colmeia with the crown first and five to vote on", async () => {
    const titles = await api.seasonTitles.list();

    expect(titles.map((title) => title.name)).toEqual(
      [ "Vencedor da estação", "Pernilongo", "Abelhudo", "Mosca-morta", "Lesma", "Cigarra" ],
    );
    expect(titles[0]).toMatchObject({ kind: "auto", emoji: "👑", active: true });
  });

  it("adds a voted title at the end of the list", async () => {
    const created = await api.seasonTitles.create({ name: " Formiga ", emoji: "🐜", description: " Carrega o dobro. " });

    expect(created).toMatchObject({ name: "Formiga", emoji: "🐜", description: "Carrega o dobro.", kind: "vote", active: true, position: 6 });
    expect((await api.seasonTitles.list()).at(-1)?.name).toBe("Formiga");
  });

  it("refuses a title with no name, no emoji or too much description", async () => {
    await expect(api.seasonTitles.create({ name: "  ", emoji: "🐜", description: "" }))
      .rejects.toMatchObject({ status: 422, details: [ "Dê um nome ao título" ] });
    await expect(api.seasonTitles.create({ name: "Formiga", emoji: " ", description: "" }))
      .rejects.toMatchObject({ status: 422, details: [ "Escolha um emoji para o título" ] });
    await expect(api.seasonTitles.create({ name: "Formiga", emoji: "🐜", description: "a".repeat(LIMITS.titleDescription + 1) }))
      .rejects.toMatchObject({ status: 422 });
  });

  it("renames and reorders a title", async () => {
    const pernilongo = await named("Pernilongo");

    const saved = await api.seasonTitles.update(pernilongo.id, { name: "Muriçoca", position: 9 });

    expect(saved).toMatchObject({ name: "Muriçoca", position: 9, kind: "vote" });
  });

  it("renames the crown and leaves it the crown", async () => {
    const crown = await named("Vencedor da estação");

    const saved = await api.seasonTitles.update(crown.id, { name: "Abelha suprema" });

    expect(saved).toMatchObject({ name: "Abelha suprema", kind: "auto" });
  });

  it("deletes a voted title nobody was ever called", async () => {
    const cigarra = await named("Cigarra");

    await api.seasonTitles.remove(cigarra.id);

    expect((await api.seasonTitles.list()).map((title) => title.name)).not.toContain("Cigarra");
  });

  it("turns off a title somebody was already called, and keeps the votes", async () => {
    const pernilongo = await named("Pernilongo");

    await api.seasonTitles.remove(pernilongo.id);

    expect((await api.seasonTitles.list()).find((title) => title.id === pernilongo.id)?.active).toBe(false);
    expect((await api.votes.list(PAST_SEASON_ID)).filter((vote) => vote.seasonTitleId === pernilongo.id)).toHaveLength(3);
  });

  it("keeps the crown, which the ranking awards on its own", async () => {
    const crown = await named("Vencedor da estação");

    await expect(api.seasonTitles.remove(crown.id))
      .rejects.toMatchObject({ status: 409, details: [ "Esse é o título da coroa, e a coroa fica na lista" ] });
  });

  describe("voting", () => {
    it("opens only once the estação is encerrada", async () => {
      const pernilongo = await named("Pernilongo");

      await expect(api.votes.cast(SEASON_ID, { seasonTitleId: pernilongo.id, voterId: ANA, voteeId: BRUNO }))
        .rejects.toMatchObject({ status: 409, details: [ "A votação abre quando a estação encerrar" ] });
    });

    it("records a vote in a closed estação", async () => {
      const lesma = await named("Lesma");

      const vote = await api.votes.cast(PAST_SEASON_ID, { seasonTitleId: lesma.id, voterId: CLARA, voteeId: BRUNO });

      expect(vote).toMatchObject({ seasonId: PAST_SEASON_ID, seasonTitleId: lesma.id, voterId: CLARA, voteeId: BRUNO });
    });

    it("changes a vote instead of adding a second one", async () => {
      const pernilongo = await named("Pernilongo");
      const before = (await api.votes.list(PAST_SEASON_ID)).length;

      await api.votes.cast(PAST_SEASON_ID, { seasonTitleId: pernilongo.id, voterId: ANA, voteeId: CLARA });
      const votes = await api.votes.list(PAST_SEASON_ID);

      expect(votes).toHaveLength(before);
      expect(votes.find((vote) => vote.seasonTitleId === pernilongo.id && vote.voterId === ANA)?.voteeId).toBe(CLARA);
    });

    it("lets someone vote for themselves, because families are honest", async () => {
      const lesma = await named("Lesma");

      const vote = await api.votes.cast(PAST_SEASON_ID, { seasonTitleId: lesma.id, voterId: CLARA, voteeId: CLARA });

      expect(vote.voteeId).toBe(CLARA);
    });

    it("refuses a vote on the crown", async () => {
      const crown = await named("Vencedor da estação");

      await expect(api.votes.cast(PAST_SEASON_ID, { seasonTitleId: crown.id, voterId: ANA, voteeId: BRUNO }))
        .rejects.toMatchObject({ status: 422 });
    });

    it("refuses a vote for somebody who is not in the colmeia", async () => {
      const lesma = await named("Lesma");

      await expect(api.votes.cast(PAST_SEASON_ID, { seasonTitleId: lesma.id, voterId: ANA, voteeId: 999 }))
        .rejects.toMatchObject({ status: 404 });
    });

    it("takes a vote back, and shrugs when there was none", async () => {
      const pernilongo = await named("Pernilongo");
      const before = (await api.votes.list(PAST_SEASON_ID)).length;

      await api.votes.clear(PAST_SEASON_ID, { seasonTitleId: pernilongo.id, voterId: ANA });
      await api.votes.clear(PAST_SEASON_ID, { seasonTitleId: pernilongo.id, voterId: ANA });

      expect(await api.votes.list(PAST_SEASON_ID)).toHaveLength(before - 1);
    });

    it("spans every estação when no estação is named", async () => {
      const all = await api.votes.list(null);

      expect(all).toHaveLength(5);
      expect(all.every((vote) => vote.seasonId === PAST_SEASON_ID)).toBe(true);
      expect(await api.votes.list(SEASON_ID)).toEqual([]);
    });

    it("takes the votes of whoever leaves the colmeia with them", async () => {
      await api.members.remove(BRUNO);

      const votes = await api.votes.list(null);

      expect(votes.some((vote) => vote.voterId === BRUNO || vote.voteeId === BRUNO)).toBe(false);
    });
  });

  it("gives the default titles to a colmeia stored before they existed", async () => {
    const store = new MemoryStore();
    store.setItem(HOUSEHOLD_INDEX_KEY, JSON.stringify({ velha: { name: "Casa velha", createdAt: now.toISOString(), demo: false } }));
    store.setItem(`${HOUSEHOLD_KEY_PREFIX}velha`, JSON.stringify({
      household: { id: 1, name: "Casa velha", inviteCode: "velha" },
      members: [], tasks: [], completions: [], shoppingItems: [], goals: [], nextId: 40,
    }));
    const older = new LocalApi(store, { clock: () => now });
    older.setInviteCode("velha");

    const titles = await older.seasonTitles.list();

    expect(titles.map((title) => title.name)).toEqual(
      [ "Vencedor da estação", "Pernilongo", "Abelhudo", "Mosca-morta", "Lesma", "Cigarra" ],
    );
    expect(await older.votes.list(null)).toEqual([]);
    // The estação it grew and the six titles each took an id of their own.
    expect((await older.seasonTitles.create({ name: "Formiga", emoji: "🐜", description: "" })).id).toBe(47);
  });
});
