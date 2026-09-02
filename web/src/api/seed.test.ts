import { describe, expect, it } from "vitest";
import { memberAchievements } from "../domain/achievements";
import { crownHolder } from "../domain/crown";
import { awardedPoints } from "../domain/points";
import { goalProgress } from "../domain/progress";
import { EXAMPLE_HOUSEHOLD_NAME } from "./localState";
import { buildDemoState } from "./seed";

const now = new Date(2026, 8, 1, 21);

describe("buildDemoState", () => {
  it("is an example colmeia, and says so", () => {
    expect(buildDemoState(now).household).toMatchObject({ name: EXAMPLE_HOUSEHOLD_NAME, demo: true });
  });

  it("opens the demo with a crown already on someone's head, under a title they picked", () => {
    const state = buildDemoState(now);
    const household = state.goals.find((goal) => goal.memberId === null) ?? null;

    const crown = crownHolder({ members: state.members, completions: state.completions, goal: household, now });

    expect(crown?.member.name).toBe("Bruno");
    expect(crown?.member.crownTitle).toBe("Abelhão");
  });

  it("pays the lagartinha her multiplier all the way back through the history", () => {
    const state = buildDemoState(now);
    const duda = state.members.find((member) => member.name === "Duda");
    if (!duda) throw new Error("the demo needs Duda");
    const hers = state.completions.filter((completion) => completion.memberId === duda.id && completion.status === "approved");

    expect(duda).toMatchObject({ kind: "lagartinha", pointsMultiplier: 1.5 });
    expect(hers).not.toHaveLength(0);
    hers.forEach((completion) => {
      expect(completion.multiplier).toBe(duda.pointsMultiplier);
      expect(completion.pointsAwarded).toBe(awardedPoints(completion.taskPoints, completion.rating, completion.multiplier));
    });
  });

  it("pins on the profile only badges the person actually earned", () => {
    const state = buildDemoState(now);
    const pinned = state.members.filter((member) => member.favoriteAchievements.length > 0);

    expect(pinned.map((member) => [ member.name, member.favoriteAchievements.length ])).toEqual([ [ "Ana", 2 ], [ "Bruno", 1 ] ]);
    pinned.forEach((member) => {
      const achievements = memberAchievements({ memberId: member.id, completions: state.completions, tasks: state.tasks });
      member.favoriteAchievements.forEach((key) => {
        expect(achievements.find((achievement) => achievement.id === key)?.unlocked).toBe(true);
      });
    });
  });

  it("still leaves this week's goal to play for", () => {
    const state = buildDemoState(now);
    const household = state.goals.find((goal) => goal.memberId === null);
    if (!household) throw new Error("the demo needs a household goal");

    expect(goalProgress(household, state.completions, now).reached).toBe(false);
  });
});
