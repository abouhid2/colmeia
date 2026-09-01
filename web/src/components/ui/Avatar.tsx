import { MEMBER_COLORS } from "../../domain/memberColors";
import type { Member } from "../../domain/types";
import { cn } from "../../lib/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<Size, string> = {
  xs: "size-6 text-xs",
  sm: "size-8 text-base",
  md: "size-10 text-xl",
  lg: "size-14 text-3xl",
  xl: "size-20 text-5xl",
};

interface AvatarProps {
  member: Pick<Member, "avatar" | "color" | "name">;
  size?: Size;
  className?: string;
}

export function Avatar({ member, size = "md", className }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={member.name}
      className={cn("inline-grid shrink-0 place-items-center rounded-full leading-none", MEMBER_COLORS[member.color].chip, SIZE_CLASSES[size], className)}
    >
      {member.avatar}
    </span>
  );
}
