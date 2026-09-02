import { describe, expect, it } from "vitest";
import { crownHolder } from "../domain/crown";
import { goalProgress } from "../domain/progress";
import { buildDemoState } from "./seed";

const now = new Date(2026, 8, 1, 21);

describe("buildDemoState", () => {
  it("opens the demo with a crown already on someone's head, under a title they picked", () => {
    const state = buildDemoState(now);
    const household = state.goals.find((goal) => goal.memberId === null) ?? null;

    const crown = crownHolder({ members: state.members, completions: state.completions, goal: household, now });

    expect(crown?.member.name).toBe("Bruno");
    expect(crown?.member.crownTitle).toBe("Abelhão");
  });

  it("still leaves this week's goal to play for", () => {
    const state = buildDemoState(now);
    const household = state.goals.find((goal) => goal.memberId === null);
    if (!household) throw new Error("the demo needs a household goal");

    expect(goalProgress(household, state.completions, now).reached).toBe(false);
  });
});
