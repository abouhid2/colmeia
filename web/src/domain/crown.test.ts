import { describe, expect, it } from "vitest";
import { crownHolder, previousPeriodBounds } from "./crown";
import type { Completion, Goal, Member } from "./types";

const member = (id: number, name: string, crownTitle = "Abelha Rainha"): Member => ({
  id, name, avatar: "🐝", color: "honey", crownTitle, kind: "bee", pointsMultiplier: 1,
  claimedAt: null, createdAt: "2026-01-01T00:00:00.000Z",
});

const members = [member(1, "Ana"), member(2, "Bruno"), member(3, "Clara")];

const completion = (overrides: Partial<Completion>): Completion => ({
  id: 1, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-03-04T10:00:00.000Z", reviewedAt: null, ...overrides,
});

/** A Wednesday. The week before it runs Mon 2 Mar to Sun 8 Mar. */
const now = new Date(2026, 2, 11, 15);
const goal: Goal = { id: 9, title: "Pizza", targetPoints: 100, period: "week", memberId: null };

describe("previousPeriodBounds", () => {
  it("steps back one week, still starting on Monday", () => {
    expect(previousPeriodBounds("week", now)).toEqual({ start: new Date(2026, 2, 2), end: new Date(2026, 2, 9) });
  });

  it("steps back one calendar month", () => {
    expect(previousPeriodBounds("month", now)).toEqual({ start: new Date(2026, 1, 1), end: new Date(2026, 2, 1) });
  });

  it("steps back from a long month into a short one without drifting", () => {
    expect(previousPeriodBounds("month", new Date(2026, 2, 31))).toEqual({ start: new Date(2026, 1, 1), end: new Date(2026, 2, 1) });
  });
});

describe("crownHolder", () => {
  it("crowns whoever scored most in the period just gone", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 60 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 40 }),
      ],
      goal,
      now,
    });

    expect(crown?.member.id).toBe(1);
    expect(crown?.points).toBe(60);
    expect(crown?.wonIn).toEqual({ start: new Date(2026, 2, 2), end: new Date(2026, 2, 9) });
    expect(crown?.wearsUntil).toEqual({ start: new Date(2026, 2, 9), end: new Date(2026, 2, 16) });
  });

  it("ignores points scored in the current period", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 120 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 500, completedAt: "2026-03-10T10:00:00.000Z" }),
      ],
      goal,
      now,
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
      goal,
      now,
    });

    expect(crown?.member.id).toBe(1);
  });

  it("crowns nobody when only unreviewed work would have reached the goal", () => {
    const crown = crownHolder({
      members,
      completions: [completion({ memberId: 2, pointsAwarded: 900, status: "pending" })],
      goal,
      now,
    });

    expect(crown).toBeNull();
  });

  it("crowns nobody when the household goal was missed", () => {
    const crown = crownHolder({
      members,
      completions: [completion({ memberId: 2, pointsAwarded: 99 })],
      goal,
      now,
    });

    expect(crown).toBeNull();
  });

  it("crowns the top scorer when the house has no goal at all", () => {
    const crown = crownHolder({
      members,
      completions: [completion({ memberId: 3, pointsAwarded: 12 })],
      goal: null,
      now,
    });

    expect(crown?.member.id).toBe(3);
  });

  it("breaks a points tie with the number of tasks", () => {
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 60 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 30 }),
        completion({ id: 3, memberId: 2, pointsAwarded: 30 }),
      ],
      goal,
      now,
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
      goal,
      now,
    });

    expect(crown).toBeNull();
  });

  it("crowns nobody when the period was empty", () => {
    expect(crownHolder({ members, completions: [], goal: null, now })).toBeNull();
  });

  it("leaves the crown unworn when the winner wants none, instead of passing it down", () => {
    const crown = crownHolder({
      members: [member(1, "Ana", ""), member(2, "Bruno"), member(3, "Clara")],
      completions: [
        completion({ id: 1, memberId: 1, pointsAwarded: 200 }),
        completion({ id: 2, memberId: 2, pointsAwarded: 120 }),
      ],
      goal,
      now,
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
      goal,
      now,
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
      goal,
      now,
    });

    expect(crown?.member.name).toBe("Bruno");
    expect(crown?.member.crownTitle).toBe("Rei da Louça");
  });

  it("follows a monthly goal into the month before", () => {
    const monthly: Goal = { ...goal, period: "month", targetPoints: 50 };
    const crown = crownHolder({
      members,
      completions: [
        completion({ id: 1, memberId: 3, pointsAwarded: 70, completedAt: "2026-02-20T10:00:00.000Z" }),
        completion({ id: 2, memberId: 1, pointsAwarded: 900, completedAt: "2026-03-02T10:00:00.000Z" }),
      ],
      goal: monthly,
      now,
    });

    expect(crown?.member.id).toBe(3);
    expect(crown?.period).toBe("month");
    expect(crown?.wonIn).toEqual({ start: new Date(2026, 1, 1), end: new Date(2026, 2, 1) });
  });
});
