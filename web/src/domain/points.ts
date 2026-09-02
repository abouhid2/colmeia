export const MAX_RATING = 5;
export const POINT_PRESETS = [5, 10, 20, 50];

/** A 5-star job earns every point; a 1-star job earns a fifth of them. */
export function pointsForRating(taskPoints: number, rating: number): number {
  return Math.round((taskPoints * rating) / MAX_RATING);
}

/**
 * What a completion is actually worth: the rating scales the task's own points
 * first, then the doer's multiplier applies. Pass null when nobody rates it.
 */
export function awardedPoints(basePoints: number, rating: number | null, multiplier: number): number {
  const rated = rating === null ? basePoints : pointsForRating(basePoints, rating);
  // Fix the binary error before rounding: 10 * 1.15 is 11.499999999999998 here
  // and 11.5 in Ruby, and both sides have to land on the same integer.
  return Math.round(Number((rated * multiplier).toFixed(6)));
}

export function formatPoints(points: number): string {
  return points === 1 ? "1 ponto" : `${points} pontos`;
}
