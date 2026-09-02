const NICE_CELL_VALUES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];

export const MAX_CELLS = 30;

/** Points each honeycomb cell stands for, chosen so the comb has at most MAX_CELLS cells. */
export function cellValueFor(target: number): number {
  return NICE_CELL_VALUES.find((value) => Math.ceil(target / value) <= MAX_CELLS) ?? Math.ceil(target / MAX_CELLS);
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/** Fill fraction (0..1) of every cell, left to right. The last cell may be worth fewer points. */
export function honeycombCells(earned: number, target: number): number[] {
  const value = cellValueFor(target);
  const count = Math.ceil(target / value);
  return Array.from({ length: count }, (_, index) => {
    const cellStart = index * value;
    const cellSpan = Math.min(value, target - cellStart);
    return clamp01((earned - cellStart) / cellSpan);
  });
}

/** What one person put into the goal. A null member is honey nobody is
 *  credited with any more: the points of somebody who left the colmeia. */
export interface Contribution {
  memberId: number | null;
  points: number;
}

/** A slice of one cell, as fractions of the cell's height, bottom to top. */
export interface CellSegment {
  memberId: number | null;
  from: number;
  to: number;
}

/** The contributions plus whatever the goal earned that nobody is credited
 *  with, so the comb fills exactly as far as the number under it says. */
export function creditedContributions(contributions: Contribution[], earned: number): Contribution[] {
  const attributed = contributions.reduce((sum, one) => sum + Math.max(one.points, 0), 0);
  const orphaned = earned - attributed;
  return orphaned > 0 ? [ ...contributions, { memberId: null, points: orphaned } ] : contributions;
}

/** Who filled each cell, left to right. Contributions arrive sorted, biggest
 *  first, and are laid end to end, so a cell where two people meet is split
 *  between them. What a cell adds up to is what honeycombCells says it is;
 *  points past the target are dropped, the rest of the comb stays empty. */
export function honeycombSegments(contributions: Contribution[], target: number): CellSegment[][] {
  const value = cellValueFor(target);
  const count = Math.ceil(target / value);
  const cells: CellSegment[][] = Array.from({ length: count }, () => []);
  let filled = 0;

  for (const { memberId, points } of contributions) {
    if (filled >= target) break;
    const start = filled;
    const end = Math.min(start + Math.max(points, 0), target);
    filled = end;
    if (end === start) continue;

    const first = Math.floor(start / value);
    const last = Math.min(Math.ceil(end / value) - 1, count - 1);
    for (let index = first; index <= last; index += 1) {
      const cellStart = index * value;
      const cellSpan = Math.min(value, target - cellStart);
      const from = clamp01((start - cellStart) / cellSpan);
      const to = clamp01((end - cellStart) / cellSpan);
      if (to > from) cells[index].push({ memberId, from, to });
    }
  }

  return cells;
}

export function honeycombColumns(count: number): number {
  if (count <= 8) return count;
  if (count <= 16) return Math.ceil(count / 2);
  if (count <= 24) return Math.ceil(count / 3);
  return 10;
}
