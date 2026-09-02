import type { AchievementRecord } from "../../domain/achievementHistory";
import { AchievementCard } from "./AchievementCard";

export function AchievementList({ achievements }: { achievements: AchievementRecord[] }) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <>
      <p className="mb-3 text-sm text-ink-soft">
        <span className="font-semibold text-ink tabular-nums">{unlocked}</span> de {achievements.length} conquistadas.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ul>
    </>
  );
}
