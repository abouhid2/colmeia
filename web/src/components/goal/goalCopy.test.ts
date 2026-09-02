import { describe, expect, it } from "vitest";
import { emptyNavPreferences } from "../../domain/navigation";
import {
  goalOpeningPhrase, goalPreviewSentence, goalStretchPhrase, goalWindowPhrase,
  hasOwnWindow, participantsLabel, seasonEnding, seasonRange, seasonStatus,
} from "./goalCopy";
import type { Member, Season } from "../../domain/types";

const preview = { ownerName: null, targetPoints: 300, seasonName: "Estação atual", reward: "Pizza e filme no sábado" };

const season = (overrides: Partial<Season> = {}): Season => ({
  id: 7, name: "Estação atual", startsOn: "2026-03-09", endsOn: null, closedAt: null,
  createdAt: "2026-03-09T00:00:00.000Z", tasksCount: 0, completionsCount: 0, ...overrides,
});

describe("goalPreviewSentence", () => {
  it("says the colmeia goal first and the reward second", () => {
    expect(goalPreviewSentence(preview)).toBe(
      "Quando a colmeia juntar 300 pontos na estação Estação atual, ganha: Pizza e filme no sábado.",
    );
  });

  it("names the person when the goal is only theirs", () => {
    expect(goalPreviewSentence({ ...preview, ownerName: "Duda", targetPoints: 30, reward: "Sorvete na sexta" })).toBe(
      "Quando Duda juntar 30 pontos na estação Estação atual, ganha: Sorvete na sexta.",
    );
  });

  it("follows the estação it belongs to", () => {
    expect(goalPreviewSentence({ ...preview, seasonName: "Estação do verão" })).toContain("na estação Estação do verão");
  });

  it("keeps reading while the reward is still empty", () => {
    expect(goalPreviewSentence({ ...preview, reward: "   " })).toBe(
      "Quando a colmeia juntar 300 pontos na estação Estação atual, ganha a recompensa combinada.",
    );
  });

  it("drops the number while the points field is empty or invalid", () => {
    expect(goalPreviewSentence({ ...preview, targetPoints: 0 })).toBe(
      "Quando a colmeia bater a meta na estação Estação atual, ganha: Pizza e filme no sábado.",
    );
    expect(goalPreviewSentence({ ...preview, targetPoints: Number.NaN })).toContain("bater a meta");
  });

  it("says one point in the singular", () => {
    expect(goalPreviewSentence({ ...preview, targetPoints: 1 })).toContain("juntar 1 ponto ");
  });

  it("agrees with a group, not just one person", () => {
    expect(goalPreviewSentence({ ...preview, ownerName: "Ana e Bruno", plural: true, targetPoints: 80, reward: "Cinema" })).toBe(
      "Quando Ana e Bruno juntarem 80 pontos na estação Estação atual, ganham: Cinema.",
    );
    expect(goalPreviewSentence({ ...preview, ownerName: "Ana e Bruno", plural: true, targetPoints: 0, reward: "" })).toContain(
      "baterem a meta na estação Estação atual, ganham a recompensa combinada",
    );
  });

  it("falls back to the colmeia when the owner name is blank", () => {
    expect(goalPreviewSentence({ ...preview, ownerName: "  " })).toContain("Quando a colmeia");
  });
});

describe("season copy", () => {
  it("says the end date, or that there is none", () => {
    expect(seasonEnding(season({ endsOn: "2026-09-30" }))).toBe("até 30 de set");
    expect(seasonEnding(season())).toBe("sem data de fim");
  });

  it("reads the two ends together", () => {
    expect(seasonRange(season({ endsOn: "2026-03-15" }))).toBe("9 de mar · até 15 de mar");
  });

  it("says whether the estação is still running", () => {
    expect(seasonStatus(season())).toBe("em andamento");
    expect(seasonStatus(season({ closedAt: "2026-03-16T00:00:00.000Z" }))).toBe("encerrada");
  });
});

const member = (id: number, name: string): Member => ({
  id, name, avatar: "🐝", color: "honey", crownTitle: "Abelha Rainha", kind: "bee", pointsMultiplier: 1,
  favoriteAchievements: [], navPreferences: emptyNavPreferences(), claimedAt: null, createdAt: "2026-03-09T00:00:00.000Z",
});

describe("participantsLabel", () => {
  it("says the colmeia when nobody is named", () => {
    expect(participantsLabel([])).toBe("A colmeia inteira");
  });

  it("spells out up to three names", () => {
    expect(participantsLabel([ member(1, "Ana") ])).toBe("Ana");
    expect(participantsLabel([ member(1, "Ana"), member(2, "Duda") ])).toBe("Ana e Duda");
    expect(participantsLabel([ member(1, "Ana"), member(2, "Bruno"), member(3, "Duda") ])).toBe("Ana, Bruno e Duda");
  });

  it("counts the rest once the list gets long", () => {
    const four = [ member(1, "Ana"), member(2, "Bruno"), member(3, "Clara"), member(4, "Duda") ];

    expect(participantsLabel(four)).toBe("Ana, Bruno e mais 2");
  });
});

describe("goal window copy", () => {
  const quarter = season({ startsOn: "2026-09-01", endsOn: "2026-11-30" });

  it("reads the two ends of a window a goal carries", () => {
    expect(goalWindowPhrase({ startsOn: "2026-09-01", endsOn: "2026-09-30" }, quarter)).toBe("De 1 de set a 30 de set");
  });

  it("falls back to the estação's own ends", () => {
    expect(goalWindowPhrase({ startsOn: null, endsOn: null }, quarter)).toBe("De 1 de set a 30 de nov");
    expect(goalWindowPhrase({ startsOn: "2026-09-15", endsOn: null }, season())).toBe("De 15 de set até o fim da estação");
  });

  it("fits inside a sentence, and says plainly when the goal spans everything", () => {
    expect(goalStretchPhrase({ startsOn: null, endsOn: null }, quarter)).toBe("nesta estação");
    expect(goalStretchPhrase({ startsOn: "2026-09-01", endsOn: "2026-09-30" }, quarter)).toBe("de 1 de set a 30 de set");
  });

  it("knows whether a goal carries days of its own", () => {
    expect(hasOwnWindow({ startsOn: null, endsOn: null })).toBe(false);
    expect(hasOwnWindow({ startsOn: null, endsOn: "2026-09-30" })).toBe(true);
  });
});

describe("goalOpeningPhrase", () => {
  const today = new Date(2026, 8, 1, 10);

  it("counts the days until a goal opens", () => {
    expect(goalOpeningPhrase("2026-09-13", today)).toBe("começa em 12 dias");
    expect(goalOpeningPhrase("2026-09-02", today)).toBe("começa amanhã");
    expect(goalOpeningPhrase("2026-09-01", today)).toBe("começa hoje");
  });
});
