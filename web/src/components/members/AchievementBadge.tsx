import {
  CalendarCheck, Coins, Dumbbell, Eye, Flame, Gem, ListChecks, Sparkles, Star, Trophy, type LucideIcon,
} from "lucide-react";
import type { AchievementId } from "../../domain/achievements";
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

type Size = "xs" | "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
};

const ICON_CLASSES: Record<Size, string> = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

interface AchievementBadgeProps {
  id: AchievementId;
  unlocked?: boolean;
  size?: Size;
  className?: string;
}

/** The little medal every badge wears, lit up once it is earned. */
export function AchievementBadge({ id, unlocked = true, size = "md", className }: AchievementBadgeProps) {
  const Icon = ICONS[id];

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        unlocked ? "bg-honey-300 text-honey-900" : "bg-dune-100 text-ink-faint",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Icon className={ICON_CLASSES[size]} aria-hidden />
    </span>
  );
}
