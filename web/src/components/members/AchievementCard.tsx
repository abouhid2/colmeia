import { Star } from "lucide-react";
import type { AchievementRecord } from "../../domain/achievementHistory";
import { MAX_FAVORITE_ACHIEVEMENTS } from "../../domain/achievements";
import { formatShortDate } from "../../lib/dates";
import { cn } from "../../lib/cn";
import { IconButton } from "../ui/IconButton";
import { AchievementBadge } from "./AchievementBadge";

export interface PinToggleProps {
  pinned: boolean;
  /** Three is the whole shelf: pinning a fourth would have to push one out. */
  disabled: boolean;
  onToggle(): void;
}

interface AchievementCardProps {
  achievement: AchievementRecord;
  /** Only there on your own page: nobody pins a badge for somebody else. */
  pin?: PinToggleProps;
}

/** "Conquistada em 3 mar", or the first and the latest for the repeatable ones. */
function earnedLabel({ count, firstAwardedAt, lastAwardedAt }: AchievementRecord): string {
  if (firstAwardedAt === null) return "Conquistada";
  if (count < 2 || lastAwardedAt === null) return `Conquistada em ${formatShortDate(firstAwardedAt)}`;
  return `Primeira em ${formatShortDate(firstAwardedAt)} · última em ${formatShortDate(lastAwardedAt)}`;
}

function PinToggle({ pinned, disabled, onToggle }: PinToggleProps) {
  const label = pinned
    ? "Tirar do perfil"
    : disabled ? `Você já fixou ${MAX_FAVORITE_ACHIEVEMENTS} conquistas` : "Fixar no perfil";

  return (
    <IconButton
      label={label}
      aria-pressed={pinned}
      disabled={disabled}
      onClick={onToggle}
      icon={<Star className={cn("size-4", pinned && "fill-honey-500 text-honey-600")} />}
    />
  );
}

export function AchievementCard({ achievement, pin }: AchievementCardProps) {
  const { id, unlocked, name, hint, progress, current, target, count } = achievement;

  return (
    <li className={cn("flex gap-3 rounded-card border p-4", unlocked ? "border-honey-300 bg-honey-100" : "border-line bg-surface")}>
      <AchievementBadge id={id} unlocked={unlocked} />
      <div className="min-w-0 flex-1">
        <p className={cn("flex flex-wrap items-center gap-1.5 font-semibold", !unlocked && "text-ink-soft")}>
          {name}
          {count > 1 && (
            <span className="rounded-full bg-honey-300 px-1.5 text-xs font-bold tabular-nums text-honey-900">×{count}</span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>
        <p className={cn("mt-1 text-xs font-semibold tabular-nums", unlocked ? "text-honey-700" : "text-ink-faint")}>
          {unlocked ? earnedLabel(achievement) : progress}
        </p>
        {!unlocked && (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-dune-100">
            <div className="h-full rounded-full bg-honey-400" style={{ width: `${(current / target) * 100}%` }} />
          </div>
        )}
      </div>
      {pin && <PinToggle {...pin} />}
    </li>
  );
}
