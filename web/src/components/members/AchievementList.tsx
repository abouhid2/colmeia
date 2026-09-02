import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AchievementRecord } from "../../domain/achievementHistory";
import { cn } from "../../lib/cn";
import { AchievementBadge } from "./AchievementBadge";
import { AchievementCard } from "./AchievementCard";

/** A compact medallion for the collapsed row: just enough to recognize what was unlocked. */
function UnlockedMedallion({ achievement }: { achievement: AchievementRecord }) {
  return (
    <li className="flex items-center gap-1.5 rounded-full border border-honey-300 bg-honey-100 py-1 pr-3 pl-1">
      <AchievementBadge id={achievement.id} size="xs" />
      <span className="text-xs font-semibold text-ink">{achievement.name}</span>
      {achievement.count > 1 && <span className="text-xs font-bold tabular-nums text-honey-700">×{achievement.count}</span>}
    </li>
  );
}

interface AchievementListProps {
  achievements: AchievementRecord[];
  memberName: string;
}

/**
 * Collapsed by default: the header states the score and a compact row shows only
 * the unlocked badges. Expanding reveals every card, locked ones included with
 * their progress. The whole header is the toggle, sized for a thumb at 390px.
 */
export function AchievementList({ achievements, memberName }: AchievementListProps) {
  const [ expanded, setExpanded ] = useState(false);
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
      <p className="text-sm text-ink-soft">O que {memberName} já ganhou, e o que falta.</p>

      <div hidden={expanded} className="mt-3">
        {unlocked.length === 0 ? (
          <p className="text-sm text-ink-faint">{memberName} ainda não tem conquista nenhuma.</p>
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
