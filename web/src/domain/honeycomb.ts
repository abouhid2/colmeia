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

export function honeycombColumns(count: number): number {
  if (count <= 8) return count;
  if (count <= 16) return Math.ceil(count / 2);
  if (count <= 24) return Math.ceil(count / 3);
  return 10;
}
