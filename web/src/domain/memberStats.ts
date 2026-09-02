import type { Completion } from "./types";

export interface MemberStats {
  /** Everything this person finished, waiting on a review or not. */
  tasksCount: number;
  points: number;
  /** Average of the ratings they received, or null when nobody rated them yet. */
  averageRating: number | null;
  reviewsGiven: number;
}

export function memberStats(memberId: number, completions: Completion[]): MemberStats {
  const own = completions.filter((completion) => completion.memberId === memberId);
  const rated = own.filter((completion) => completion.rating !== null);
  const ratingSum = rated.reduce((sum, completion) => sum + (completion.rating ?? 0), 0);

  return {
    tasksCount: own.length,
    points: own.reduce((sum, completion) => sum + completion.pointsAwarded, 0),
    averageRating: rated.length === 0 ? null : ratingSum / rated.length,
    reviewsGiven: completions.filter((completion) => completion.reviewerId === memberId).length,
  };
}
