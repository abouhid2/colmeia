export const MAX_RATING = 5;
export const POINT_PRESETS = [5, 10, 20, 50];

/** A 5-star job earns every point; a 1-star job earns a fifth of them. */
export function pointsForRating(taskPoints: number, rating: number): number {
  return Math.round((taskPoints * rating) / MAX_RATING);
}

export function formatPoints(points: number): string {
  return points === 1 ? "1 ponto" : `${points} pontos`;
}
