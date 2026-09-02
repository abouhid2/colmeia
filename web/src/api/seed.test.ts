import { describe, expect, it } from "vitest";
import { memberAchievements } from "../domain/achievements";
import { crownHolder } from "../domain/crown";
import { awardedPoints } from "../domain/points";
import { goalProgress } from "../domain/progress";
import { defaultSeason, lastClosedSeason } from "../domain/seasons";
import { votedTitles, votesInSeason } from "../domain/seasonTitles";
import { titleResults } from "../domain/titleResults";
import { EXAMPLE_HOUSEHOLD_NAME, withCounts } from "./localState";
import { buildDemoState } from "./seed";

const now = new Date(2026, 8, 1, 21);

/** The estação the app would open on, with its counts filled in. */
function currentSeason(state: ReturnType<typeof buildDemoState>) {
  const season = defaultSeason(state.seasons.map((item) => withCounts(state, item)), now);
  if (!season) throw new Error("the demo needs an estação");
  return season;
}

describe("buildDemoState", () => {
  it("is an example colmeia, and says so", () => {
    expect(buildDemoState(now).household).toMatchObject({ name: EXAMPLE_HOUSEHOLD_NAME, demo: true });
  });

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

  it("leaves the closed estação already voted, with a winner and a draw", () => {
    const state = buildDemoState(now);
    const past = state.seasons.find((season) => season.name === "Estação passada");
    if (!past) throw new Error("the demo needs the closed estação");
    const cast = votesInSeason(state.titleVotes, past.id);

    const results = titleResults(votedTitles(state.seasonTitles), cast, state.members);
    const pernilongo = results.find((result) => result.title.name === "Pernilongo");
    const lesma = results.find((result) => result.title.name === "Lesma");

    expect(pernilongo).toMatchObject({ winner: expect.objectContaining({ name: "Bruno" }), totalVotes: 3, tie: false });
    expect(pernilongo?.tallies[0].votes).toBe(2);
    expect(lesma).toMatchObject({ winner: null, tie: true, totalVotes: 2 });
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

  it("still leaves the running estação's goal to play for", () => {
    const state = buildDemoState(now);
    const season = currentSeason(state);
    const household = state.goals.find((goal) => goal.memberId === null && goal.seasonId === season.id);
    if (!household) throw new Error("the demo needs a household goal");

    expect(goalProgress(household, state.completions, season, now).reached).toBe(false);
  });
});
