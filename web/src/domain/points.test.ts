import { describe, expect, it } from "vitest";
import { pointsForRating } from "./points";

describe("pointsForRating", () => {
  it("scales points by the star rating", () => {
    expect(pointsForRating(20, 5)).toBe(20);
    expect(pointsForRating(20, 1)).toBe(4);
    expect(pointsForRating(7, 3)).toBe(4);
    expect(pointsForRating(5, 3)).toBe(3);
  });
});
