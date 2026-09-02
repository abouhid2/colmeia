import { describe, expect, it } from "vitest";
import type { Crown } from "../../domain/crown";
import { emptyNavPreferences } from "../../domain/navigation";
import type { TitleResult } from "../../domain/titleResults";
import type { Member, Season, SeasonTitle } from "../../domain/types";
import { crownTitleLine, crownVerdict, joinNames, titleResultLine, voteCount } from "./titleCopy";

const member = (id: number, name: string, crownTitle = "Abelha Rainha"): Member => ({
  id, name, avatar: "🐝", color: "honey", crownTitle, kind: "bee", pointsMultiplier: 1,
  favoriteAchievements: [], navPreferences: emptyNavPreferences(), claimedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
});

const [ ana, bruno, duda ] = [ member(1, "Ana"), member(2, "Bruno", "Abelhão"), member(3, "Duda") ];

const title: SeasonTitle = {
  id: 40, name: "Pernilongo", description: "Só perturbou.", emoji: "🦟", kind: "vote", position: 1, active: true,
};

const result = (overrides: Partial<TitleResult>): TitleResult => ({
  title, tallies: [], winner: null, tie: false, totalVotes: 0, ...overrides,
});

const season: Season = {
  id: 7, name: "Estação passada", startsOn: "2026-03-02", endsOn: null, closedAt: "2026-03-09T00:00:00.000Z",
  createdAt: "2026-03-02T00:00:00.000Z", tasksCount: 0, completionsCount: 0,
};

describe("voteCount and joinNames", () => {
  it("counts one vote and many", () => {
    expect(voteCount(1)).toBe("1 voto");
    expect(voteCount(3)).toBe("3 votos");
  });

  it("lists names the way a sentence does", () => {
    expect(joinNames([ "Bruno" ])).toBe("Bruno");
    expect(joinNames([ "Bruno", "Duda" ])).toBe("Bruno e Duda");
    expect(joinNames([ "Bruno", "Clara", "Duda" ])).toBe("Bruno, Clara e Duda");
    expect(joinNames([])).toBe("");
  });
});

describe("titleResultLine", () => {
  it("names whoever took the título and by how much", () => {
    const line = titleResultLine(result({
      tallies: [ { member: bruno, votes: 3 }, { member: ana, votes: 1 } ], winner: bruno, totalVotes: 4,
    }));

    expect(line).toBe("Pernilongo da estação: Bruno, 3 votos");
  });

  it("says who was level on a draw", () => {
    const line = titleResultLine(result({
      tallies: [ { member: bruno, votes: 1 }, { member: duda, votes: 1 } ], tie: true, totalVotes: 2,
    }));

    expect(line).toBe("Empate entre Bruno e Duda");
  });

  it("says nothing happened while nobody voted", () => {
    expect(titleResultLine(result({}))).toBe("Ninguém votou ainda");
  });

  it("owns up when every vote went to somebody who left", () => {
    expect(titleResultLine(result({ totalVotes: 2 }))).toBe("Quem levou esse título já saiu da colmeia");
  });
});

describe("crownVerdict", () => {
  it("says the meta was missed, and that nobody wears the coroa", () => {
    expect(crownVerdict(false, false)).toBe("Meta não batida, ninguém leva a coroa");
  });

  it("says the meta was beaten when somebody took the coroa", () => {
    expect(crownVerdict(true, true)).toBe("Meta da colmeia batida");
  });

  it("stays quiet when the estação had no meta of the colmeia", () => {
    expect(crownVerdict(null, true)).toBeNull();
    expect(crownVerdict(true, false)).toBeNull();
  });
});

describe("crownTitleLine", () => {
  const winner: Crown = { member: bruno, points: 90, tasksCount: 2, wonIn: season };

  it("waits for the estação to close", () => {
    expect(crownTitleLine(false, null, null)).toBe("A coroa sai quando a estação encerrar");
  });

  it("names the winner under the título they picked", () => {
    expect(crownTitleLine(true, winner, true)).toBe("Bruno venceu, como Abelhão");
  });

  it("blames the meta when that is what stopped the coroa", () => {
    expect(crownTitleLine(true, null, false)).toBe("Meta não batida, ninguém levou");
    expect(crownTitleLine(true, null, null)).toBe("Ninguém levou desta vez");
  });
});
