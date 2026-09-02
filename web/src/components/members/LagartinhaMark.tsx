import { formatMultiplier } from "../../domain/memberKinds";
import type { Member } from "../../domain/types";
import { useLagartinhasEnabled } from "../../hooks/useLagartinhas";
import { cn } from "../../lib/cn";

interface LagartinhaMarkProps {
  member: Pick<Member, "kind" | "pointsMultiplier">;
  /** Just the multiplier, for rows where the word does not fit. */
  compact?: boolean;
  className?: string;
}

/** Says out loud that this person earns more, and how much. Every caterpillar
 *  mark in the app comes from here, so a colmeia with the switch off is quiet
 *  wherever a name is shown, without each screen having to remember. */
export function LagartinhaMark({ member, compact = false, className }: LagartinhaMarkProps) {
  const enabled = useLagartinhasEnabled();
  if (!enabled || member.kind !== "lagartinha") return null;
  const multiplier = formatMultiplier(member.pointsMultiplier);

  return (
    <span
      aria-label={`Lagartinha, ganha ${multiplier}`}
      className={cn("inline-flex shrink-0 items-center gap-1 rounded-full bg-leaf-100 px-2 py-0.5 text-xs font-semibold text-leaf-700", className)}
    >
      <span aria-hidden>🐛</span>
      <span aria-hidden>{compact ? multiplier : `Lagartinha · ${multiplier}`}</span>
    </span>
  );
}
