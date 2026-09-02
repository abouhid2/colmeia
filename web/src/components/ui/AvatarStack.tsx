import type { Member } from "../../domain/types";
import { cn } from "../../lib/cn";
import { Avatar } from "./Avatar";

interface AvatarStackProps {
  members: Member[];
  /** How many faces fit before the rest become a number. */
  max?: number;
  className?: string;
}

/** Overlapping faces for the people behind something, with the rest counted. */
export function AvatarStack({ members, max = 3, className }: AvatarStackProps) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;

  return (
    <span className={cn("flex shrink-0 items-center", className)}>
      {shown.map((member, index) => (
        <Avatar
          key={member.id}
          member={member}
          size="xs"
          className={cn("ring-2 ring-surface", index > 0 && "-ml-2")}
        />
      ))}
      {rest > 0 && (
        <span className="-ml-2 grid size-6 place-items-center rounded-full bg-dune-100 text-xs font-semibold text-ink-soft ring-2 ring-surface">
          +{rest}
        </span>
      )}
    </span>
  );
}
