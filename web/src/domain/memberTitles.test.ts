import { describe, expect, it } from "vitest";
import { memberTitles } from "./memberTitles";
import { emptyNavPreferences } from "./navigation";
import { defaultSeasonTitles } from "./seasonTitles";
import type { Completion, Goal, Member, Season, SeasonTitleVote } from "./types";

const member = (id: number, name: string, crownTitle = "Abelha Rainha"): Member => ({
  id, name, avatar: "🐝", color: "honey", crownTitle, kind: "bee", pointsMultiplier: 1,
  favoriteAchievements: [], navPreferences: emptyNavPreferences(), claimedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
});

const [ ana, bruno ] = [ member(1, "Ana", "Rainha da Louça"), member(2, "Bruno", "Abelhão") ];
const members = [ ana, bruno ];

const season = (overrides: Partial<Season> & Pick<Season, "id">): Season => ({
  name: "Estação", startsOn: "2026-03-02", endsOn: null, closedAt: null,
  createdAt: "2026-03-02T00:00:00.000Z", tasksCount: 0, completionsCount: 0, ...overrides,
});

const older = season({ id: 5, name: "Estação de março", startsOn: "2026-03-02", closedAt: "2026-03-09T00:00:00.000Z" });
const past = season({ id: 6, name: "Estação passada", startsOn: "2026-03-09", closedAt: "2026-03-16T00:00:00.000Z" });
const running = season({ id: 7, name: "Estação atual", startsOn: "2026-03-16" });

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, seasonId: past.id, taskId: null, memberId: ana.id, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-10T10:00:00.000Z", reviewedAt: null, ...overrides,
});

const titles = defaultSeasonTitles(10);
const pernilongo = titles[1];
const lesma = titles[4];

const vote = (id: number, seasonId: number, titleId: number, voterId: number, voteeId: number): SeasonTitleVote => ({
  id, seasonId, seasonTitleId: titleId, voterId, voteeId,
});

const now = new Date(2026, 2, 11, 15);
const base = { seasons: [ older, past, running ], titles, members, goals: [] as Goal[], now };

describe("memberTitles", () => {
  it("lists the crown under the name the winner picked for themselves", () => {
    const awards = memberTitles({
      ...base, memberId: bruno.id, votes: [],
      completions: [ completion({ memberId: bruno.id, pointsAwarded: 90 }), completion({ id: 2, pointsAwarded: 10 }) ],
    });

    expect(awards).toEqual([ { season: past, emoji: "👑", label: "Abelhão" } ]);
  });

  it("lists a voted title under the name of the title", () => {
    const awards = memberTitles({
      ...base, memberId: bruno.id, completions: [],
      votes: [ vote(1, past.id, pernilongo.id, ana.id, bruno.id) ],
    });

    expect(awards).toEqual([ { season: past, emoji: "🦟", label: "Pernilongo" } ]);
  });

  it("says nothing about a title that ended in a draw", () => {
    const awards = memberTitles({
      ...base, memberId: bruno.id, completions: [],
      votes: [ vote(1, past.id, lesma.id, ana.id, bruno.id), vote(2, past.id, lesma.id, bruno.id, ana.id) ],
    });

    expect(awards).toEqual([]);
  });

  it("counts nothing from an estação still running", () => {
    const awards = memberTitles({
      ...base, memberId: bruno.id,
      completions: [ completion({ seasonId: running.id, memberId: bruno.id, pointsAwarded: 900 }) ],
      votes: [ vote(1, running.id, pernilongo.id, ana.id, bruno.id) ],
    });

    expect(awards).toEqual([]);
  });

  it("walks the estações newest first, crown before the voted ones", () => {
    const awards = memberTitles({
      ...base, memberId: bruno.id,
      completions: [ completion({ memberId: bruno.id, pointsAwarded: 90 }), completion({ id: 2, seasonId: older.id, memberId: bruno.id, pointsAwarded: 40 }) ],
      votes: [ vote(1, past.id, pernilongo.id, ana.id, bruno.id), vote(2, older.id, lesma.id, ana.id, bruno.id) ],
    });

    expect(awards.map((award) => [ award.season.name, award.label ])).toEqual([
      [ "Estação passada", "Abelhão" ],
      [ "Estação passada", "Pernilongo" ],
      [ "Estação de março", "Abelhão" ],
      [ "Estação de março", "Lesma" ],
    ]);
  });

  it("says nothing when the colmeia goal of that estação was missed", () => {
    const awards = memberTitles({
      ...base, memberId: bruno.id, votes: [],
      goals: [ { id: 9, seasonId: past.id, title: "Pizza", targetPoints: 500, memberIds: [], startsOn: null, endsOn: null } ],
      completions: [ completion({ memberId: bruno.id, pointsAwarded: 90 }) ],
    });

    expect(awards).toEqual([]);
  });
});
