import { describe, expect, it } from "vitest";
import { emptyNavPreferences } from "./navigation";
import { leadersOf, titleResults } from "./titleResults";
import type { Member, SeasonTitle, SeasonTitleVote } from "./types";

const member = (id: number, name: string): Member => ({
  id, name, avatar: "🐝", color: "honey", crownTitle: "Abelha Rainha", kind: "bee", pointsMultiplier: 1,
  favoriteAchievements: [], navPreferences: emptyNavPreferences(), claimedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
});

const [ ana, bruno, clara ] = [ member(1, "Ana"), member(2, "Bruno"), member(3, "Clara") ];
const members = [ ana, bruno, clara ];

const pernilongo: SeasonTitle = {
  id: 40, name: "Pernilongo", description: "Só perturbou.", emoji: "🦟", kind: "vote", position: 1, active: true,
};
const lesma: SeasonTitle = { ...pernilongo, id: 41, name: "Lesma", emoji: "🐌", position: 2 };

const vote = (id: number, titleId: number, voterId: number, voteeId: number): SeasonTitleVote => ({
  id, seasonId: 7, seasonTitleId: titleId, voterId, voteeId,
});

describe("titleResults", () => {
  it("gives the title to whoever got the most votes", () => {
    const [ result ] = titleResults([ pernilongo ], [
      vote(1, pernilongo.id, ana.id, bruno.id),
      vote(2, pernilongo.id, clara.id, bruno.id),
      vote(3, pernilongo.id, bruno.id, ana.id),
    ], members);

    expect(result.winner?.name).toBe("Bruno");
    expect(result.tie).toBe(false);
    expect(result.totalVotes).toBe(3);
    expect(result.tallies.map((tally) => [ tally.member.name, tally.votes ])).toEqual([ [ "Bruno", 2 ], [ "Ana", 1 ] ]);
  });

  it("gives it to nobody on a draw, and says who was level", () => {
    const [ result ] = titleResults([ pernilongo ], [
      vote(1, pernilongo.id, ana.id, bruno.id),
      vote(2, pernilongo.id, bruno.id, clara.id),
    ], members);

    expect(result.tie).toBe(true);
    expect(result.winner).toBeNull();
    expect(leadersOf(result.tallies).map((tally) => tally.member.name)).toEqual([ "Bruno", "Clara" ]);
  });

  it("takes a single vote as the whole answer", () => {
    const [ result ] = titleResults([ pernilongo ], [ vote(1, pernilongo.id, ana.id, clara.id) ], members);

    expect(result.winner?.name).toBe("Clara");
    expect(result.tie).toBe(false);
    expect(result.tallies).toHaveLength(1);
  });

  it("follows a changed vote instead of counting both", () => {
    const before = titleResults([ pernilongo ], [ vote(1, pernilongo.id, ana.id, bruno.id) ], members)[0];
    // Ana thought better of it: the same vote, pointed elsewhere.
    const after = titleResults([ pernilongo ], [ vote(1, pernilongo.id, ana.id, clara.id) ], members)[0];

    expect(before.winner?.name).toBe("Bruno");
    expect(after.winner?.name).toBe("Clara");
    expect(after.totalVotes).toBe(1);
  });

  it("counts each title on its own", () => {
    const results = titleResults([ pernilongo, lesma ], [
      vote(1, pernilongo.id, ana.id, bruno.id),
      vote(2, lesma.id, ana.id, clara.id),
      vote(3, lesma.id, bruno.id, clara.id),
    ], members);

    expect(results.map((result) => result.winner?.name)).toEqual([ "Bruno", "Clara" ]);
    expect(results.map((result) => result.totalVotes)).toEqual([ 1, 2 ]);
  });

  it("has nothing to say about a title nobody voted on", () => {
    const [ result ] = titleResults([ pernilongo ], [], members);

    expect(result).toMatchObject({ winner: null, tie: false, totalVotes: 0, tallies: [] });
  });

  it("keeps counting a vote for somebody who left, without naming them", () => {
    const [ result ] = titleResults([ pernilongo ], [ vote(1, pernilongo.id, ana.id, 99) ], members);

    expect(result.totalVotes).toBe(1);
    expect(result.tallies).toEqual([]);
    expect(result.winner).toBeNull();
  });
});
