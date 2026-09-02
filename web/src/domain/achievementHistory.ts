import { isRepeatable, type Achievement, type AchievementEvent, type AchievementId } from "./achievements";
import type { AchievementAward, AchievementAwardInput } from "./types";

/** One badge, one moment: either written down or just derived from the data. */
export interface AchievementMoment {
  key: AchievementId;
  completionId: number | null;
  awardedAt: string;
}

export interface AchievementRecord extends Achievement {
  /** How many times it was earned, counting what is written down. */
  count: number;
  firstAwardedAt: string | null;
  lastAwardedAt: string | null;
}

function slot({ key, completionId }: AchievementMoment): string {
  return `${key}:${completionId ?? "sem conclusão"}`;
}

function fromAward(award: AchievementAward): AchievementMoment {
  return { key: award.key, completionId: award.completionId, awardedAt: award.awardedAt };
}

function fromEvent(event: AchievementEvent): AchievementMoment {
  return { key: event.id, completionId: event.completionId, awardedAt: event.awardedAt };
}

function oldestFirst(left: AchievementMoment, right: AchievementMoment): number {
  return Date.parse(left.awardedAt) - Date.parse(right.awardedAt);
}

/**
 * Everything this person ever earned, oldest first: what was written down,
 * plus what was earned since and has not been stored yet. Stored moments whose
 * completion is long gone stay in, which is the point of storing them.
 */
export function achievementHistory(events: AchievementEvent[], awards: AchievementAward[]): AchievementMoment[] {
  const seen = new Set<string>();
  const milestones = new Set<AchievementId>();
  const history: AchievementMoment[] = [];

  for (const moment of [ ...awards.map(fromAward), ...events.map(fromEvent) ].sort(oldestFirst)) {
    // A milestone is earned once, no matter which completion ends up crossing it.
    if (seen.has(slot(moment)) || milestones.has(moment.key)) continue;
    seen.add(slot(moment));
    if (!isRepeatable(moment.key)) milestones.add(moment.key);
    history.push(moment);
  }

  return history;
}

/** The badges the store is missing, ready to be written down. */
export function missingAwards(events: AchievementEvent[], awards: AchievementAward[]): AchievementAwardInput[] {
  const stored = new Set(awards.map((award) => slot(fromAward(award))));
  const milestones = new Set(awards.filter((award) => !isRepeatable(award.key)).map((award) => award.key));

  return events.map(fromEvent).filter((moment) => {
    if (stored.has(slot(moment)) || milestones.has(moment.key)) return false;
    stored.add(slot(moment));
    if (!isRepeatable(moment.key)) milestones.add(moment.key);
    return true;
  });
}

/**
 * Each badge with how often it was earned and when. A badge that only exists
 * in the history still reads as unlocked: the completion behind it can be
 * deleted, the badge cannot.
 */
export function achievementRecords(
  achievements: Achievement[],
  events: AchievementEvent[],
  awards: AchievementAward[],
): AchievementRecord[] {
  const history = achievementHistory(events, awards);

  return achievements.map((achievement) => {
    const moments = history.filter((moment) => moment.key === achievement.id);
    return {
      ...achievement,
      unlocked: achievement.unlocked || moments.length > 0,
      count: moments.length,
      firstAwardedAt: moments[0]?.awardedAt ?? null,
      lastAwardedAt: moments[moments.length - 1]?.awardedAt ?? null,
    };
  });
}
