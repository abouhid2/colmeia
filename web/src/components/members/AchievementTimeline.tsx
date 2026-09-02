import type { AchievementMoment, AchievementRecord } from "../../domain/achievementHistory";
import { formatShortDate } from "../../lib/dates";
import { Card } from "../ui/Card";
import { AchievementBadge } from "./AchievementBadge";

/** A profile shows the latest handful; the whole shelf lives in Conquistas. */
const SHOWN = 10;

interface AchievementTimelineProps {
  /** Newest first. */
  moments: AchievementMoment[];
  achievements: AchievementRecord[];
}

export function AchievementTimeline({ moments, achievements }: AchievementTimelineProps) {
  const names = new Map(achievements.map((achievement) => [ achievement.id, achievement.name ]));

  return (
    <Card>
      <ol className="divide-y divide-line">
        {moments.slice(0, SHOWN).map((moment) => (
          <li key={`${moment.key}-${moment.completionId}-${moment.awardedAt}`} className="flex items-center gap-3 px-4 py-2.5">
            <AchievementBadge id={moment.key} size="sm" />
            <p className="min-w-0 flex-1 truncate font-semibold">{names.get(moment.key) ?? moment.key}</p>
            <p className="shrink-0 text-xs text-ink-faint">{formatShortDate(moment.awardedAt)}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
