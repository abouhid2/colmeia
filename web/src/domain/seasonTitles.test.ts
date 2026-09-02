import { describe, expect, it } from "vitest";
import { crownTitle, defaultSeasonTitles, ownVote, reorderTitles, votedTitles, votedTitlesIn, votesInSeason } from "./seasonTitles";
import type { SeasonTitle, SeasonTitleVote } from "./types";

const titles = defaultSeasonTitles(10);
const dropped: SeasonTitle = { id: 20, name: "Formiga", description: "", emoji: "🐜", kind: "vote", position: 9, active: false };

const vote = (id: number, seasonId: number, titleId: number, voterId: number): SeasonTitleVote => ({
  id, seasonId, seasonTitleId: titleId, voterId, voteeId: 1,
});

describe("defaultSeasonTitles", () => {
  it("opens a colmeia with the crown first and five to vote on", () => {
    expect(titles.map((title) => title.name)).toEqual(
      [ "Vencedor da estação", "Pernilongo", "Abelhudo", "Mosca-morta", "Lesma", "Cigarra" ],
    );
    expect(titles.map((title) => title.id)).toEqual([ 10, 11, 12, 13, 14, 15 ]);
    expect(titles.map((title) => title.position)).toEqual([ 0, 1, 2, 3, 4, 5 ]);
    expect(titles.every((title) => title.active)).toBe(true);
  });

  it("marks exactly one as the crown", () => {
    expect(titles.filter((title) => title.kind === "auto")).toHaveLength(1);
    expect(crownTitle(titles)?.name).toBe("Vencedor da estação");
    expect(crownTitle([])).toBeNull();
  });
});

describe("votedTitles", () => {
  it("leaves the crown out and drops what the colmeia turned off", () => {
    expect(votedTitles([ ...titles, dropped ]).map((title) => title.name)).toEqual(
      [ "Pernilongo", "Abelhudo", "Mosca-morta", "Lesma", "Cigarra" ],
    );
  });

  it("still shows a dropped title in an estação where somebody was called it", () => {
    const cast = [ vote(1, 7, dropped.id, 1) ];

    expect(votedTitlesIn([ ...titles, dropped ], cast).map((title) => title.name)).toContain("Formiga");
    expect(votedTitlesIn([ ...titles, dropped ], []).map((title) => title.name)).not.toContain("Formiga");
  });
});

describe("votesInSeason and ownVote", () => {
  it("keeps each estação's votes apart", () => {
    const cast = [ vote(1, 7, 11, 1), vote(2, 8, 11, 1) ];

    expect(votesInSeason(cast, 7).map((item) => item.id)).toEqual([ 1 ]);
  });

  it("finds the vote of one person in one title, and nothing for nobody", () => {
    const cast = [ vote(1, 7, 11, 1), vote(2, 7, 11, 2) ];

    expect(ownVote(cast, 11, 2)?.id).toBe(2);
    expect(ownVote(cast, 11, 3)).toBeNull();
    expect(ownVote(cast, 11, null)).toBeNull();
  });
});

describe("reorderTitles", () => {
  it("moves one title a step down and renumbers only what changed", () => {
    expect(reorderTitles(titles, titles[1].id, 1)).toEqual([
      { id: titles[2].id, position: 1 },
      { id: titles[1].id, position: 2 },
    ]);
  });

  it("moves one title a step up", () => {
    expect(reorderTitles(titles, titles[3].id, -1)).toEqual([
      { id: titles[3].id, position: 2 },
      { id: titles[2].id, position: 3 },
    ]);
  });

  it("refuses to walk off either end, and shrugs at a title that is not there", () => {
    expect(reorderTitles(titles, titles[0].id, -1)).toEqual([]);
    expect(reorderTitles(titles, titles[5].id, 1)).toEqual([]);
    expect(reorderTitles(titles, 999, 1)).toEqual([]);
  });

  it("straightens a list whose positions drifted apart", () => {
    const drifted = titles.map((title, index) => ({ ...title, position: index * 10 }));

    expect(reorderTitles(drifted, drifted[0].id, 1)).toEqual([
      { id: titles[1].id, position: 0 },
      { id: titles[0].id, position: 1 },
      { id: titles[2].id, position: 2 },
      { id: titles[3].id, position: 3 },
      { id: titles[4].id, position: 4 },
      { id: titles[5].id, position: 5 },
    ]);
  });
});
