import { describe, expect, it } from "vitest";
import { joinNames, lagartinhaNames, lagartinhasOffNote } from "./lagartinhas";
import { emptyNavPreferences } from "./navigation";
import type { Member } from "./types";

function member(name: string, kind: Member["kind"]): Member {
  return {
    id: name.length, name, avatar: "🐝", color: "honey", pattern: "solid", kind,
    pointsMultiplier: kind === "lagartinha" ? 1.5 : 1,
    claimedAt: null, crownTitle: "", favoriteAchievements: [], navPreferences: emptyNavPreferences(),
    createdAt: "2026-03-11T12:00:00.000Z",
  };
}

describe("joinNames", () => {
  it("writes a list the way a person says it out loud", () => {
    expect(joinNames([])).toBe("");
    expect(joinNames([ "Duda" ])).toBe("Duda");
    expect(joinNames([ "Duda", "Caio" ])).toBe("Duda e Caio");
    expect(joinNames([ "Duda", "Caio", "Nina" ])).toBe("Duda, Caio e Nina");
  });
});

describe("lagartinhaNames", () => {
  it("picks out the children, in the order the colmeia lists them", () => {
    const members = [ member("Ana", "bee"), member("Duda", "lagartinha"), member("Caio", "lagartinha") ];

    expect(lagartinhaNames(members)).toEqual([ "Duda", "Caio" ]);
  });
});

describe("lagartinhasOffNote", () => {
  it("says nothing when nobody in the colmeia is a lagartinha", () => {
    expect(lagartinhasOffNote([ member("Ana", "bee") ])).toBeNull();
  });

  it("promises the child is still there, and still paid, for one child", () => {
    const note = lagartinhasOffNote([ member("Ana", "bee"), member("Duda", "lagartinha") ]);

    expect(note).toBe(
      "Duda continua na colmeia como lagartinha, só não aparece nada disso enquanto o ajuste estiver desligado."
      + " Os pontos de quem já é lagartinha continuam multiplicados.",
    );
  });

  it("agrees in number when there is more than one", () => {
    const note = lagartinhasOffNote([ member("Duda", "lagartinha"), member("Caio", "lagartinha") ]);

    expect(note).toContain("Duda e Caio continuam na colmeia como lagartinhas");
  });
});
