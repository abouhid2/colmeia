import { describe, expect, it } from "vitest";
import {
  NAV_KEYS, emptyNavPreferences, isNavKeyVisible, navOrder, normalizeNavPreferences,
  splitBottomBar, withNavKeyMoved, withNavKeyVisible,
} from "./navigation";

describe("normalizeNavPreferences", () => {
  it("keeps the screens it knows, in the order they were given", () => {
    expect(normalizeNavPreferences({ order: [ "seasons", "home" ], hidden: [ "shopping" ] }))
      .toEqual({ order: [ "seasons", "home" ], hidden: [ "shopping" ] });
  });

  it("drops a screen it does not know, so another release cannot store one", () => {
    expect(normalizeNavPreferences({ order: [ "home", "garagem" ], hidden: [ "garagem" ] }))
      .toEqual({ order: [ "home" ], hidden: [] });
  });

  it("keeps a screen once, however many times it was named", () => {
    expect(normalizeNavPreferences({ order: [ "home", "home", "tasks" ] }).order).toEqual([ "home", "tasks" ]);
  });

  it("refuses to hide Início: it is the way back to everything else", () => {
    expect(normalizeNavPreferences({ hidden: [ "home", "shopping" ] }).hidden).toEqual([ "shopping" ]);
  });

  it("answers with an empty preference for anything that is not one", () => {
    expect(normalizeNavPreferences(undefined)).toEqual(emptyNavPreferences());
    expect(normalizeNavPreferences("home")).toEqual(emptyNavPreferences());
    expect(normalizeNavPreferences({ order: "home" })).toEqual(emptyNavPreferences());
  });
});

describe("navOrder", () => {
  it("gives the default order to somebody who never arranged anything", () => {
    expect(navOrder(emptyNavPreferences())).toEqual([ ...NAV_KEYS ]);
  });

  it("appends a screen the app added after this person arranged theirs", () => {
    const arranged = normalizeNavPreferences({ order: [ "tasks", "home" ] });

    expect(navOrder(arranged)).toEqual([ "tasks", "home", "shopping", "family", "achievements", "seasons" ]);
  });
});

describe("isNavKeyVisible", () => {
  it("hides what this person turned off and keeps Início whatever happens", () => {
    expect(isNavKeyVisible({ order: [], hidden: [ "shopping" ] }, "shopping")).toBe(false);
    expect(isNavKeyVisible({ order: [], hidden: [ "shopping" ] }, "tasks")).toBe(true);
    expect(isNavKeyVisible({ order: [], hidden: [ "home" ] }, "home")).toBe(true);
  });
});

describe("withNavKeyMoved", () => {
  it("swaps a screen with the one next to it and writes the whole order down", () => {
    const moved = withNavKeyMoved(emptyNavPreferences(), "seasons", -1);

    expect(moved.order).toEqual([ "home", "tasks", "shopping", "family", "seasons", "achievements" ]);
  });

  it("leaves the ends alone: nothing moves past the top or the bottom", () => {
    expect(withNavKeyMoved(emptyNavPreferences(), "home", -1).order).toEqual([ ...NAV_KEYS ]);
    expect(withNavKeyMoved(emptyNavPreferences(), "seasons", 1).order).toEqual([ ...NAV_KEYS ]);
  });
});

describe("withNavKeyVisible", () => {
  it("turns a screen off and back on", () => {
    const off = withNavKeyVisible(emptyNavPreferences(), "shopping", false);
    expect(off.hidden).toEqual([ "shopping" ]);

    expect(withNavKeyVisible(off, "shopping", true).hidden).toEqual([]);
  });

  it("never turns Início off", () => {
    expect(withNavKeyVisible(emptyNavPreferences(), "home", false).hidden).toEqual([]);
  });

  it("writes the order down alongside, so today's arrangement is the one that sticks", () => {
    expect(withNavKeyVisible(emptyNavPreferences(), "shopping", false).order).toEqual([ ...NAV_KEYS ]);
  });
});

describe("splitBottomBar", () => {
  it("fills all five slots when five screens are all there is", () => {
    expect(splitBottomBar([ 1, 2, 3, 4, 5 ])).toEqual({ tabs: [ 1, 2, 3, 4, 5 ], overflow: [] });
  });

  it("keeps the fifth slot for the rest once there is a sixth screen", () => {
    expect(splitBottomBar([ 1, 2, 3, 4, 5, 6 ])).toEqual({ tabs: [ 1, 2, 3, 4 ], overflow: [ 5, 6 ] });
  });

  it("shows the few screens somebody left themselves", () => {
    expect(splitBottomBar([ 1, 2 ])).toEqual({ tabs: [ 1, 2 ], overflow: [] });
  });
});
