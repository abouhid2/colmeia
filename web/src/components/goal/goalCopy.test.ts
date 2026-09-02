import { describe, expect, it } from "vitest";
import { goalPreviewSentence, seasonEnding, seasonRange, seasonStatus } from "./goalCopy";
import type { Season } from "../../domain/types";

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
