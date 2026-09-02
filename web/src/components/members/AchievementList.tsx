import { useId, useState } from "react";
import {
  CalendarCheck, ChevronDown, Coins, Dumbbell, Eye, Flame, Gem, ListChecks, Sparkles, Star, Trophy, type LucideIcon,
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

/** A compact medallion for the collapsed row: just enough to recognize what was unlocked. */
function UnlockedMedallion({ achievement }: { achievement: Achievement }) {
  const Icon = ICONS[achievement.id];
  return (
    <li className="flex items-center gap-1.5 rounded-full border border-honey-300 bg-honey-100 py-1 pr-3 pl-1">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-honey-300 text-honey-900">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="text-xs font-semibold text-ink">{achievement.name}</span>
    </li>
  );
}

/**
 * Collapsed by default: the header states the score and a compact row shows only
 * the unlocked badges. Expanding reveals every card, locked ones included with
 * their progress. The whole header is the toggle, sized for a thumb at 390px.
 */
export function AchievementList({ achievements }: { achievements: Achievement[] }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const unlocked = achievements.filter((achievement) => achievement.unlocked);

  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-between gap-3 rounded-card py-1 text-left hover:opacity-80"
        >
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span>Conquistas</span>
            <span className="text-sm font-semibold text-ink-soft">
              <span className="tabular-nums">{unlocked.length}</span> de <span className="tabular-nums">{achievements.length}</span> conquistadas
            </span>
          </span>
          <ChevronDown
            className={cn("size-5 shrink-0 text-ink-faint transition-transform duration-200 motion-reduce:transition-none", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </h2>

      <div hidden={expanded} className="mt-3">
        {unlocked.length === 0 ? (
          <p className="text-sm text-ink-faint">Nenhuma conquistada ainda.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {unlocked.map((achievement) => (
              <UnlockedMedallion key={achievement.id} achievement={achievement} />
            ))}
          </ul>
        )}
      </div>

      <ul
        id={contentId}
        hidden={!expanded}
        className="mt-3 grid gap-3 sm:grid-cols-2 animate-rise motion-reduce:animate-none"
      >
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ul>
    </div>
  );
}
