import {
  CalendarCheck, Coins, Dumbbell, Eye, Flame, Gem, ListChecks, Sparkles, Star, Trophy, type LucideIcon,
} from "lucide-react";
import type { Achievement, AchievementId } from "../../domain/achievements";
import { cn } from "../../lib/cn";

const ICONS: Record<AchievementId, LucideIcon> = {
  firstTask: Sparkles,
  tenTasks: ListChecks,
  fiftyTasks: Trophy,
  hundredPoints: Coins,
  fiveHundredPoints: Gem,
  flawless: Star,
  fiveReviews: Eye,
  urgentTask: Flame,
  bigTask: Dumbbell,
  sevenDays: CalendarCheck,
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICONS[achievement.id];
  const { unlocked, name, hint, progress, current, target } = achievement;

  return (
    <li
      className={cn(
        "flex gap-3 rounded-card border p-4",
        unlocked ? "border-honey-300 bg-honey-100" : "border-line bg-surface",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          unlocked ? "bg-honey-300 text-honey-900" : "bg-dune-100 text-ink-faint",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className={cn("font-semibold", !unlocked && "text-ink-soft")}>{name}</p>
        <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>
        <p className={cn("mt-1 text-xs font-semibold tabular-nums", unlocked ? "text-honey-700" : "text-ink-faint")}>
          {unlocked ? "Conquistada" : progress}
        </p>
        {!unlocked && (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-dune-100">
            <div className="h-full rounded-full bg-honey-400" style={{ width: `${(current / target) * 100}%` }} />
          </div>
        )}
      </div>
    </li>
  );
}

export function AchievementList({ achievements }: { achievements: Achievement[] }) {
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
