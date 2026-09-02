import { describe, expect, it } from "vitest";
import { cellValueFor, honeycombCells, honeycombColumns, honeycombSegments, type Contribution } from "./honeycomb";

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

  it("gives every cell to the only person who filled it", () => {
    const cells = honeycombSegments([ { memberId: 7, points: 25 } ], 50);

    expect(cells[0]).toEqual([ { memberId: 7, from: 0, to: 1 } ]);
    expect(cells[12]).toEqual([ { memberId: 7, from: 0, to: 0.5 } ]);
    expect(cells[13]).toEqual([]);
  });

  it("splits the cell where two people meet", () => {
    const cells = honeycombSegments([ { memberId: 1, points: 25 }, { memberId: 2, points: 15 } ], 50);

    expect(cells[12]).toEqual([ { memberId: 1, from: 0, to: 0.5 }, { memberId: 2, from: 0.5, to: 1 } ]);
    expect(cells[13]).toEqual([ { memberId: 2, from: 0, to: 1 } ]);
    expect(cells[19]).toEqual([ { memberId: 2, from: 0, to: 1 } ]);
    expect(cells[20]).toEqual([]);
  });

  it("leaves out whoever has no points yet", () => {
    const cells = honeycombSegments([ { memberId: 1, points: 10 }, { memberId: 2, points: 0 } ], 50);

    expect(cells.flat().every((segment) => segment.memberId === 1)).toBe(true);
  });

  it("stops at the target when the colmeia went past it", () => {
    const cells = honeycombSegments([ { memberId: 1, points: 80 } ], 50);

    expect(cells).toHaveLength(25);
    expect(cells.every((cell) => cell.length === 1 && cell[0].to === 1)).toBe(true);
  });

  it("fills each cell exactly as much as honeycombCells says", () => {
    const contributions: Contribution[] = [
      { memberId: 1, points: 37 }, { memberId: 2, points: 30 }, { memberId: 3, points: 20 }, { memberId: 4, points: 8 },
    ];
    const earned = contributions.reduce((sum, one) => sum + one.points, 0);

    const filled = honeycombSegments(contributions, 300).map((cell) => cell.reduce((sum, { from, to }) => sum + (to - from), 0));

    expect(filled).toEqual(honeycombCells(earned, 300));
  });

  it("keeps the last, shorter cell in step with honeycombCells", () => {
    const filled = honeycombSegments([ { memberId: 1, points: 54 } ], 55).map((cell) => cell.reduce((sum, { from, to }) => sum + (to - from), 0));

    expect(filled).toEqual(honeycombCells(54, 55));
  });

  it("wraps rows so the comb stays wide and short", () => {
    expect(honeycombColumns(6)).toBe(6);
    expect(honeycombColumns(12)).toBe(6);
    expect(honeycombColumns(30)).toBe(10);
  });
});
