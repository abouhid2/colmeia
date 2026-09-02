import { useEffect, useMemo, useRef } from "react";
import { achievementEvents } from "../domain/achievements";
import { missingAwards } from "../domain/achievementHistory";
import type { AchievementAward, AchievementAwardInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useCompletions } from "./useCompletions";
import { useScopedQuery } from "./useScopedQuery";
import { useTasks } from "./useTasks";

const EMPTY: AchievementAward[] = [];
const NOTHING_MISSING: AchievementAwardInput[] = [];

/** Every badge written down in this colmeia, oldest first. */
export function useAchievementAwards() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.awards, () => api.achievementAwards.list(null));
  return { ...query, awards: query.data ?? EMPTY };
}

export function useMemberAwards(memberId: number | null): AchievementAward[] {
  const { awards } = useAchievementAwards();
  return useMemo(() => awards.filter((award) => award.memberId === memberId), [ awards, memberId ]);
}

function useRecordAwards() {
  const api = useApi();
  return useAppMutation(
    ({ memberId, awards }: { memberId: number; awards: AchievementAwardInput[] }) => api.achievementAwards.record(memberId, awards),
    { invalidates: [ queryKeys.awards ] },
  );
}

/**
 * Writes down what this person has earned and the store does not have yet.
 * Badges are derived from the completions, so they would vanish with them:
 * storing every award is what keeps the count and the dates for good.
 */
export function useAchievementSync(memberId: number | null): void {
  const { completions } = useCompletions();
  const { tasks } = useTasks();
  const { isPending } = useAchievementAwards();
  const stored = useMemberAwards(memberId);
  const { mutate } = useRecordAwards();
  // What went out already, so a refetch in flight does not send it twice.
  const sent = useRef("");

  const missing = useMemo(() => {
    if (memberId === null || isPending) return NOTHING_MISSING;
    return missingAwards(achievementEvents({ memberId, completions, tasks }), stored);
  }, [ memberId, isPending, completions, tasks, stored ]);

  useEffect(() => {
    if (memberId === null || missing.length === 0) return;
    const batch = [ memberId, ...missing.map((award) => `${award.key}:${award.completionId}`) ].join("|");
    if (sent.current === batch) return;
    sent.current = batch;
    mutate({ memberId, awards: missing });
  }, [ memberId, missing, mutate ]);
}
