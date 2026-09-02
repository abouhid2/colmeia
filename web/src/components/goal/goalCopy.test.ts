import { describe, expect, it } from "vitest";
import { goalPreviewSentence, periodWhen } from "./goalCopy";

const preview = { ownerName: null, targetPoints: 300, period: "week" as const, reward: "Pizza e filme no sábado" };

describe("goalPreviewSentence", () => {
  it("says the household goal first and the reward second", () => {
    expect(goalPreviewSentence(preview)).toBe(
      "Quando a casa juntar 300 pontos nesta semana, ganha: Pizza e filme no sábado.",
    );
  });

  it("names the person when the goal is only theirs", () => {
    expect(goalPreviewSentence({ ...preview, ownerName: "Duda", targetPoints: 30, reward: "Sorvete na sexta" })).toBe(
      "Quando Duda juntar 30 pontos nesta semana, ganha: Sorvete na sexta.",
    );
  });

  it("follows the period", () => {
    expect(goalPreviewSentence({ ...preview, period: "month" })).toContain("neste mês");
    expect(periodWhen("month")).toBe("neste mês");
  });

  it("keeps reading while the reward is still empty", () => {
    expect(goalPreviewSentence({ ...preview, reward: "   " })).toBe(
      "Quando a casa juntar 300 pontos nesta semana, ganha a recompensa combinada.",
    );
  });

  it("drops the number while the points field is empty or invalid", () => {
    expect(goalPreviewSentence({ ...preview, targetPoints: 0 })).toBe(
      "Quando a casa bater a meta nesta semana, ganha: Pizza e filme no sábado.",
    );
    expect(goalPreviewSentence({ ...preview, targetPoints: Number.NaN })).toContain("bater a meta");
  });

  it("says one point in the singular", () => {
    expect(goalPreviewSentence({ ...preview, targetPoints: 1 })).toContain("juntar 1 ponto ");
  });

  it("falls back to the household when the owner name is blank", () => {
    expect(goalPreviewSentence({ ...preview, ownerName: "  " })).toContain("Quando a casa");
  });
});
