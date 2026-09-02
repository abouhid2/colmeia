import { describe, expect, it } from "vitest";
import { crownHolder } from "../domain/crown";
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

  it("still leaves the running estação's goal to play for", () => {
    const state = buildDemoState(now);
    const season = currentSeason(state);
    const household = state.goals.find((goal) => goal.memberId === null && goal.seasonId === season.id);
    if (!household) throw new Error("the demo needs a household goal");

    expect(goalProgress(household, state.completions, season, now).reached).toBe(false);
  });
});
