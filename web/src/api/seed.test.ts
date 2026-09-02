import { describe, expect, it } from "vitest";
import { crownHolder } from "../domain/crown";
import { awardedPoints } from "../domain/points";
import { goalProgress } from "../domain/progress";
import { defaultSeason, lastClosedSeason } from "../domain/seasons";
import { withCounts } from "./localState";
import { buildDemoState } from "./seed";

const now = new Date(2026, 8, 1, 21);

/** The estação the app would open on, with its counts filled in. */
function currentSeason(state: ReturnType<typeof buildDemoState>) {
  const season = defaultSeason(state.seasons.map((item) => withCounts(state, item)), now);
  if (!season) throw new Error("the demo needs an estação");
  return season;
}

describe("buildDemoState", () => {
  it("opens with one estação closed and another running", () => {
    const state = buildDemoState(now);
    const seasons = state.seasons.map((season) => withCounts(state, season));

    expect(seasons.map((season) => season.name)).toEqual([ "Estação passada", "Estação atual" ]);
    expect(lastClosedSeason(seasons)?.name).toBe("Estação passada");
    expect(currentSeason(state).name).toBe("Estação atual");
  });

  it("opens the demo with a crown already on someone's head, under a title they picked", () => {
    const state = buildDemoState(now);
    const seasons = state.seasons.map((season) => withCounts(state, season));

    const crown = crownHolder({ members: state.members, completions: state.completions, seasons, goals: state.goals });

    expect(crown?.member.name).toBe("Bruno");
    expect(crown?.member.crownTitle).toBe("Abelhão");
    expect(crown?.wonIn.name).toBe("Estação passada");
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

  it("still leaves the running estação's goal to play for", () => {
    const state = buildDemoState(now);
    const season = currentSeason(state);
    const household = state.goals.find((goal) => goal.memberId === null && goal.seasonId === season.id);
    if (!household) throw new Error("the demo needs a household goal");

    expect(goalProgress(household, state.completions, season, now).reached).toBe(false);
  });
});
