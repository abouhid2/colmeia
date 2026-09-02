import { useMemo } from "react";
import { achievementEvents, memberAchievements } from "../domain/achievements";
import {
  achievementHistory, achievementRecords, type AchievementMoment, type AchievementRecord,
} from "../domain/achievementHistory";
import type { Member } from "../domain/types";
import { useMemberAwards } from "./useAchievementAwards";
import { useCompletions } from "./useCompletions";
import { useAllTasks } from "./useTasks";

export interface MemberAchievements {
  records: AchievementRecord[];
  unlocked: AchievementRecord[];
  locked: AchievementRecord[];
  /** The badges this person pinned on their profile, in their own order. */
  favorites: AchievementRecord[];
  /** Every time they earned one, newest first. */
  history: AchievementMoment[];
}

const NONE: MemberAchievements = { records: [], unlocked: [], locked: [], favorites: [], history: [] };

/** One person's badges, counted off the stored history and the data alike. */
export function useMemberAchievements(member: Member | null): MemberAchievements {
  const { completions } = useCompletions();
  // Badges are colmeia-wide, so they read every estação, not just this one.
  const { tasks } = useAllTasks();
  const awards = useMemberAwards(member?.id ?? null);

  return useMemo(() => {
    if (member === null) return NONE;
    const input = { memberId: member.id, completions, tasks };
    const events = achievementEvents(input);
    const records = achievementRecords(memberAchievements(input), events, awards);
    const byId = new Map(records.map((record) => [ record.id, record ]));

    return {
      records,
      unlocked: records.filter((record) => record.unlocked),
      locked: records.filter((record) => !record.unlocked),
      favorites: member.favoriteAchievements
        .map((key) => byId.get(key))
        .filter((record) => record !== undefined),
      history: [ ...achievementHistory(events, awards) ].reverse(),
    };
  }, [ member, completions, tasks, awards ]);
}
