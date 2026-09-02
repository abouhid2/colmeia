import { describe, expect, it } from "vitest";
import { crownHolder } from "./crown";
import { emptyNavPreferences } from "./navigation";
import type { Completion, Goal, Member, Season } from "./types";

const member = (id: number, name: string, crownTitle = "Abelha Rainha"): Member => ({
  id, name, avatar: "🐝", color: "honey", crownTitle, kind: "bee", pointsMultiplier: 1,
  favoriteAchievements: [], navPreferences: emptyNavPreferences(), claimedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
});

const members = [member(1, "Ana"), member(2, "Bruno"), member(3, "Clara")];

const season = (overrides: Partial<Season> & Pick<Season, "id">): Season => ({
  name: "Estação", startsOn: "2026-03-02", endsOn: null, closedAt: null,
  createdAt: "2026-03-02T00:00:00.000Z", tasksCount: 0, completionsCount: 0, ...overrides,
});

/** The estação that closed, and the one running now. */
const past = season({ id: 6, name: "Estação passada", startsOn: "2026-03-02", endsOn: "2026-03-08", closedAt: "2026-03-09T00:00:00.000Z" });
const current = season({ id: 7, name: "Estação atual", startsOn: "2026-03-09" });
const seasons = [past, current];

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, seasonId: past.id, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-04T10:00:00.000Z", reviewedAt: null, ...overrides,
});

const goal: Goal = { id: 9, seasonId: past.id, title: "Pizza", targetPoints: 100, memberId: null };

describe("crownHolder", () => {
  it("crowns whoever scored most in the estação that closed last", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 60 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 40 }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown?.member.id).toBe(1);
    expect(crown?.points).toBe(60);
    expect(crown?.wonIn.id).toBe(past.id);
  });

  it("ignores points scored in the estação that is still running", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 120 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 500, seasonId: current.id }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown?.member.id).toBe(1);
  });

  it("counts only approved points, for the winner and for the goal", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 120 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 900, status: "pending" }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown?.member.id).toBe(1);
  });

  it("crowns nobody when only unreviewed work would have reached the goal", () => {
    const crown = crownHolder({
      members,
      completions: [completion({ memberId: 2, pointsAwarded: 900, status: "pending" })],
      seasons,
      goals: [goal],
    });

    expect(crown).toBeNull();
  });

  it("crowns nobody when the household goal of that estação was missed", () => {
    const crown = crownHolder({ members, completions: [completion({ memberId: 2, pointsAwarded: 99 })], seasons, goals: [goal] });

    expect(crown).toBeNull();
  });

  it("ignores the goal of another estação", () => {
    const crown = crownHolder({
      members,
      completions: [completion({ memberId: 2, pointsAwarded: 40 })],
      seasons,
      goals: [{ ...goal, seasonId: current.id, targetPoints: 10_000 }],
    });

    expect(crown?.member.id).toBe(2);
  });

  it("crowns the top scorer when that estação had no household goal", () => {
    const crown = crownHolder({ members, completions: [completion({ memberId: 3, pointsAwarded: 12 })], seasons, goals: [] });

    expect(crown?.member.id).toBe(3);
  });

  it("crowns nobody while no estação has been closed", () => {
    const crown = crownHolder({
      members,
      completions: [completion({ memberId: 1, pointsAwarded: 500, seasonId: current.id })],
      seasons: [current],
      goals: [],
    });

    expect(crown).toBeNull();
  });

  it("breaks a points tie with the number of tasks", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 60 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 30 }),
        completion({ id: 3, memberId: 2, pointsAwarded: 30 }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown?.member.id).toBe(2);
    expect(crown?.tasksCount).toBe(2);
  });

  it("crowns nobody on a dead heat", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 60 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 60 }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown).toBeNull();
  });

  it("crowns nobody when the estação was empty", () => {
    expect(crownHolder({ members, completions: [], seasons, goals: [] })).toBeNull();
  });

  it("leaves the crown unworn when the winner wants none, instead of passing it down", () => {
    const crown = crownHolder({
      members: [member(1, "Ana", ""), member(2, "Bruno"), member(3, "Clara")],
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 200 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 120 }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown).toBeNull();
  });

  it("treats a whitespace-only title as no title at all", () => {
    const crown = crownHolder({
      members: [member(1, "Ana", "   "), member(2, "Bruno"), member(3, "Clara")],
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 200 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 120 }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown).toBeNull();
  });

  it("crowns the top scorer under their own title, even when someone else wants no crown", () => {
    const crown = crownHolder({
      members: [member(1, "Ana", ""), member(2, "Bruno", "Rei da Louça"), member(3, "Clara")],
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 40 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 280 }),
      ],
      seasons,
      goals: [goal],
    });

    expect(crown?.member.name).toBe("Bruno");
    expect(crown?.member.crownTitle).toBe("Rei da Louça");
  });

  it("follows the most recently closed estação when several are closed", () => {
    const older = season({ id: 5, name: "Mais antiga", startsOn: "2026-02-01", endsOn: "2026-02-28", closedAt: "2026-03-01T00:00:00.000Z" });

    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 3, pointsAwarded: 900, seasonId: older.id }),
        completion({ id: 2, memberId: 1, pointsAwarded: 120 }),
      ],
      seasons: [older, past, current],
      goals: [goal],
    });

    expect(crown?.member.id).toBe(1);
    expect(crown?.wonIn.id).toBe(past.id);
  });
});
