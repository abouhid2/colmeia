import { describe, expect, it } from "vitest";
import { cellValueFor, honeycombCells, honeycombColumns } from "./honeycomb";

describe("honeycomb", () => {
  it("picks a round cell value that keeps the comb small", () => {
    expect(cellValueFor(300)).toBe(10);
    expect(cellValueFor(30)).toBe(1);
    expect(cellValueFor(1000)).toBe(50);
  });

  it("fills cells left to right, with a partial cell in the middle", () => {
    expect(honeycombCells(25, 50)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("gives the last cell only the points that remain", () => {
    expect(honeycombCells(54, 55)).toHaveLength(28);
    expect(honeycombCells(54, 55)[27]).toBe(0);
    expect(honeycombCells(55, 55)[27]).toBe(1);
  });

  it("wraps rows so the comb stays wide and short", () => {
    expect(honeycombColumns(6)).toBe(6);
    expect(honeycombColumns(12)).toBe(6);
    expect(honeycombColumns(30)).toBe(10);
  });
});
