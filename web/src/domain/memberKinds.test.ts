import { describe, expect, it } from "vitest";
import { DEFAULT_LAGARTINHA_MULTIPLIER, formatMultiplier, multiplierForKind, multiplierHint } from "./memberKinds";

describe("multiplierForKind", () => {
  it("offers the handicap to a lagartinha who has none", () => {
    expect(multiplierForKind("lagartinha", 1)).toBe(DEFAULT_LAGARTINHA_MULTIPLIER);
  });

  it("keeps a multiplier the family chose", () => {
    expect(multiplierForKind("lagartinha", 2)).toBe(2);
  });

  it("leaves a bee alone, handicap included", () => {
    expect(multiplierForKind("bee", 1)).toBe(1);
    expect(multiplierForKind("bee", 1.5)).toBe(1.5);
  });
});

describe("formatMultiplier", () => {
  it("writes the number the way Brazilians read it", () => {
    expect(formatMultiplier(1.5)).toBe("1,5×");
    expect(formatMultiplier(1)).toBe("1×");
  });
});

describe("multiplierHint", () => {
  it("names the person and says why she earns more", () => {
    expect(multiplierHint("Duda", "lagartinha", 1.5)).toBe("Duda ganha 1,5× por ser lagartinha.");
    expect(multiplierHint("Ana", "bee", 1)).toBe("Ana ganha 1× em cada tarefa.");
    expect(multiplierHint("  ", "bee", 1)).toBe("Essa pessoa ganha 1× em cada tarefa.");
  });
});
