import { describe, expect, it } from "vitest";
import { emptyNavPreferences } from "./navigation";
import {
  byWindowStart, finishedGoal, goalAudience, goalContributions, goalsOf, goalsWithPeople, goalsWithProgress,
  householdGoals, participantsOf, runningGoal, upcomingGoal,
} from "./goalBoard";
import { goalWindow } from "./progress";
import type { Completion, Goal, Member, Season } from "./types";

const now = new Date(2026, 8, 16, 12);

const season: Season = {
  id: 7, name: "Trimestre", startsOn: "2026-09-01", endsOn: "2026-11-30", closedAt: null,
  createdAt: "2026-09-01T00:00:00.000Z", tasksCount: 0, completionsCount: 0,
};

const member = (id: number, name: string): Member => ({
  id, name, avatar: "🐝", color: "honey", pattern: "solid", crownTitle: "Abelha Rainha", kind: "bee", pointsMultiplier: 1,
  favoriteAchievements: [], navPreferences: emptyNavPreferences(), claimedAt: null, createdAt: "2026-09-01T00:00:00.000Z",
});

const members = [ member(1, "Ana"), member(2, "Bruno"), member(3, "Duda") ];

const goal = (overrides: Partial<Goal> & Pick<Goal, "id">): Goal => ({
  seasonId: season.id, title: "Meta", targetPoints: 100, memberIds: [], startsOn: null, endsOn: null, ...overrides,
});

const completion = (overrides: Partial<Completion> & Pick<Completion, "id">): Completion => ({
  seasonId: season.id, taskId: null, memberId: 1, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 10, multiplier: 1, taskTitle: "x", taskPoints: 10, completedAt: "2026-09-10T10:00:00.000Z", reviewedAt: null, ...overrides,
});

describe("goalAudience", () => {
  it("tells the colmeia, one person and a group apart", () => {
    expect(goalAudience(goal({ id: 1 }))).toBe("household");
    expect(goalAudience(goal({ id: 2, memberIds: [ 1 ] }))).toBe("personal");
    expect(goalAudience(goal({ id: 3, memberIds: [ 1, 3 ] }))).toBe("group");
  });
});

describe("participantsOf", () => {
  it("keeps the people the goal names, and nobody else", () => {
    expect(participantsOf(goal({ id: 1, memberIds: [ 3, 1 ] }), members).map((person) => person.name)).toEqual([ "Ana", "Duda" ]);
    expect(participantsOf(goal({ id: 2 }), members)).toEqual([]);
  });
});


describe("goalContributions", () => {
  const shares = (target: Goal, completions: Completion[]) =>
    goalContributions(target, completions, members, goalWindow(target, season, now))
      .map(({ member: who, points }) => [ who.name, points ]);

  it("adds up what each person put in, the biggest share first", () => {
    const completions = [
      completion({ id: 1, memberId: 2, pointsAwarded: 30 }),
      completion({ id: 2, memberId: 1, pointsAwarded: 25 }),
      completion({ id: 3, memberId: 1, pointsAwarded: 20 }),
    ];

    expect(shares(goal({ id: 1 }), completions)).toEqual([ [ "Ana", 45 ], [ "Bruno", 30 ] ]);
  });

  it("breaks a tie on the name, so the comb does not shuffle on its own", () => {
    const completions = [
      completion({ id: 1, memberId: 2, pointsAwarded: 10 }),
      completion({ id: 2, memberId: 1, pointsAwarded: 10 }),
    ];

    expect(shares(goal({ id: 1 }), completions)).toEqual([ [ "Ana", 10 ], [ "Bruno", 10 ] ]);
  });

  it("counts only the people the goal names", () => {
    const completions = [
      completion({ id: 1, memberId: 1, pointsAwarded: 10 }),
      completion({ id: 2, memberId: 2, pointsAwarded: 40 }),
    ];

    expect(shares(goal({ id: 1, memberIds: [ 1 ] }), completions)).toEqual([ [ "Ana", 10 ] ]);
  });

  it("counts only the days the goal runs", () => {
    const completions = [
      completion({ id: 1, memberId: 1, pointsAwarded: 10, completedAt: "2026-09-02T10:00:00.000Z" }),
      completion({ id: 2, memberId: 1, pointsAwarded: 40, completedAt: "2026-09-12T10:00:00.000Z" }),
    ];
    const windowed = goal({ id: 1, startsOn: "2026-09-10", endsOn: "2026-09-20" });

    expect(shares(windowed, completions)).toEqual([ [ "Ana", 40 ] ]);
  });

  it("leaves out points nobody is credited with any more", () => {
    const completions = [
      completion({ id: 1, memberId: null, pointsAwarded: 30 }),
      completion({ id: 2, memberId: 1, pointsAwarded: 10 }),
    ];

    expect(shares(goal({ id: 1 }), completions)).toEqual([ [ "Ana", 10 ] ]);
  });

  it("adds up to exactly what the goal earned, minus what nobody owns", () => {
    const completions = [
      completion({ id: 1, memberId: 1, pointsAwarded: 25 }),
      completion({ id: 2, memberId: 3, pointsAwarded: 15 }),
    ];
    const [ item ] = goalsWithProgress([ goal({ id: 1 }) ], completions, members, season, now);

    expect(item.contributions.reduce((sum, one) => sum + one.points, 0)).toBe(item.progress.earned);
  });
});

describe("goalsWithProgress", () => {
  const goals = [
    goal({ id: 1 }),
    goal({ id: 2, memberIds: [ 1, 3 ], targetPoints: 40 }),
    goal({ id: 3, seasonId: 99 }),
  ];
  const completions = [ completion({ id: 10, memberId: 1, pointsAwarded: 25 }), completion({ id: 11, memberId: 2, pointsAwarded: 30 }) ];

  it("leaves out the goals of other estações", () => {
    expect(goalsWithProgress(goals, completions, members, season, now).map((item) => item.goal.id)).toEqual([ 1, 2 ]);
  });

  it("scores each goal against the people it is for", () => {
    const [ colmeia, shared ] = goalsWithProgress(goals, completions, members, season, now);

    expect(colmeia.progress.earned).toBe(55);
    expect(shared.progress.earned).toBe(25);
    expect(shared.members.map((person) => person.name)).toEqual([ "Ana", "Duda" ]);
  });
});

describe("splitting and sorting", () => {
  const goals = [
    goal({ id: 1, startsOn: "2026-10-01", endsOn: "2026-10-07" }),
    goal({ id: 2, startsOn: "2026-09-01", endsOn: "2026-09-30" }),
    goal({ id: 3, memberIds: [ 1 ] }),
    goal({ id: 4, memberIds: [ 1, 2 ] }),
  ];
  const items = goalsWithProgress(goals, [], members, season, now);

  it("orders by the day each window opens, oldest goal first on a tie", () => {
    // 2, 3 and 4 all open with the estação; only 1 waits for October.
    expect(byWindowStart(items).map((item) => item.goal.id)).toEqual([ 2, 3, 4, 1 ]);
  });

  it("separates the colmeia's goals from the ones people are named in", () => {
    expect(householdGoals(items).map((item) => item.goal.id)).toEqual([ 1, 2 ]);
    expect(goalsWithPeople(items).map((item) => item.goal.id)).toEqual([ 3, 4 ]);
  });

  it("narrows to the goals one person is in", () => {
    expect(goalsOf(goalsWithPeople(items), 2).map((item) => item.goal.id)).toEqual([ 4 ]);
    expect(goalsOf(goalsWithPeople(items), null)).toHaveLength(2);
  });
});

describe("which goal leads the page", () => {
  const finished = goal({ id: 1, startsOn: "2026-09-01", endsOn: "2026-09-10" });
  const running = goal({ id: 2, startsOn: "2026-09-11", endsOn: "2026-09-30" });
  const shorter = goal({ id: 3, startsOn: "2026-09-14", endsOn: "2026-09-20" });
  const later = goal({ id: 4, startsOn: "2026-10-01", endsOn: "2026-10-31" });

  const board = (goals: Goal[]) => goalsWithProgress(goals, [], members, season, now);

  it("takes the one running today, and the one closing first when several do", () => {
    expect(runningGoal(board([ running, shorter ]), now)?.goal.id).toBe(3);
  });

  it("has nothing running when every window is somewhere else", () => {
    expect(runningGoal(board([ finished, later ]), now)).toBeNull();
  });

  it("looks ahead to the next window to open", () => {
    expect(upcomingGoal(board([ finished, later ]), now)?.goal.id).toBe(4);
    expect(upcomingGoal(board([ finished ]), now)).toBeNull();
  });

  it("falls back to the last window that closed", () => {
    expect(finishedGoal(board([ finished, later ]), now)?.goal.id).toBe(1);
  });
});
