import { useId } from "react";
import { MEMBER_COLORS } from "../../domain/memberColors";
import type { Member } from "../../domain/types";
import { cn } from "../../lib/cn";

type Size = "sm" | "hero";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "size-6",
  hero: "size-28",
};

interface BeeAvatarProps {
  member: Pick<Member, "name" | "color">;
  size?: Size;
  crowned?: boolean;
  label?: string;
  className?: string;
}

/** Everyone in the house is a little bee, striped in their own colour. */
export function BeeAvatar({ member, size = "sm", crowned = false, label, className }: BeeAvatarProps) {
  const bodyClip = useId();
  const stripe = MEMBER_COLORS[member.color].stripe;

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={label ?? member.name}
      className={cn("shrink-0", SIZE_CLASSES[size], className)}
    >
      <defs>
        <clipPath id={bodyClip}>
          <ellipse cx="32" cy="44" rx="15" ry="17" />
        </clipPath>
      </defs>

      <g className="fill-surface stroke-line-strong" strokeWidth="1.5" opacity="0.75">
        <ellipse cx="14" cy="33" rx="8" ry="13" transform="rotate(-28 14 33)" />
        <ellipse cx="50" cy="33" rx="8" ry="13" transform="rotate(28 50 33)" />
      </g>

      <g className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M25 14 C22 9 20 7 18 6" />
        <path d="M39 14 C42 9 44 7 46 6" />
      </g>
      <g className="fill-ink">
        <circle cx="17" cy="5" r="2.5" />
        <circle cx="47" cy="5" r="2.5" />
      </g>

      <ellipse cx="32" cy="44" rx="15" ry="17" className="fill-honey-300" />
      <g clipPath={`url(#${bodyClip})`} className={stripe}>
        <rect x="10" y="32" width="44" height="6" />
        <rect x="10" y="43" width="44" height="6" />
        <rect x="10" y="54" width="44" height="6" />
      </g>

      <circle cx="32" cy="22" r="11" className="fill-ink" />
      <g className="fill-paper">
        <circle cx="28" cy="21" r="2" />
        <circle cx="36" cy="21" r="2" />
      </g>
      <path d="M27 26 Q32 30 37 26" className="stroke-paper" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {crowned && <path d="M22 16 L22 9 L27 12.5 L32 6 L37 12.5 L42 9 L42 16 Z" className="fill-honey-500" />}
    </svg>
  );
}
