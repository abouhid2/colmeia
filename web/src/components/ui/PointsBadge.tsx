import { cn } from "../../lib/cn";

interface PointsBadgeProps {
  points: number;
  size?: "sm" | "md";
  muted?: boolean;
  signed?: boolean;
}

/** A hexagon, like a honeycomb cell, holding how many points a task is worth. */
export function PointsBadge({ points, size = "md", muted = false, signed = true }: PointsBadgeProps) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center font-display font-bold tabular-nums",
        "[clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]",
        size === "sm" ? "h-7 min-w-9 px-2.5 text-xs" : "h-9 min-w-12 px-3 text-sm",
        muted ? "bg-dune-100 text-dune-700" : "bg-honey-200 text-honey-900",
      )}
      aria-label={`${points} pontos`}
    >
      {signed ? `+${points}` : points}
    </span>
  );
}
