import { describe, expect, it } from "vitest";
import { awardedPoints, pointsForRating } from "./points";

describe("pointsForRating", () => {
  it("scales points by the star rating", () => {
    expect(pointsForRating(20, 5)).toBe(20);
    expect(pointsForRating(20, 1)).toBe(4);
    expect(pointsForRating(7, 3)).toBe(4);
    expect(pointsForRating(5, 3)).toBe(3);
  });
});

describe("awardedPoints", () => {
  it("pays a bee exactly what the task is worth", () => {
    expect(awardedPoints(20, null, 1)).toBe(20);
  });

  it("multiplies what a lagartinha earns, rounded to a whole point", () => {
    expect(awardedPoints(5, null, 1.5)).toBe(8);
    expect(awardedPoints(20, null, 1.5)).toBe(30);
  });

  it("scales by the rating first and by the multiplier after", () => {
    expect(awardedPoints(20, 4, 1.5)).toBe(24);
    expect(awardedPoints(20, 4, 1)).toBe(16);
  });

  it("rounds a half point up, the way the Rails side does", () => {
    expect(awardedPoints(10, null, 1.15)).toBe(12);
    expect(awardedPoints(5, null, 0.5)).toBe(3);
  });
});
