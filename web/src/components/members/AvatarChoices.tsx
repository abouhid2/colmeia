import { AVATAR_OPTIONS, MEMBER_COLORS } from "../../domain/memberColors";
import type { MemberColor } from "../../domain/types";
import { cn } from "../../lib/cn";

interface AvatarChoicesProps {
  avatar: string;
  color: MemberColor;
  onAvatar(avatar: string): void;
}

/** The bichinhos somebody can wear, drawn in the colour they already picked. */
export function AvatarChoices({ avatar, color, onAvatar }: AvatarChoicesProps) {
  return (
    <div role="radiogroup" aria-label="Bichinho" className="flex flex-wrap gap-1.5">
      {AVATAR_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={avatar === option}
          onClick={() => onAvatar(option)}
          className={cn("grid size-10 place-items-center rounded-full text-xl transition-transform hover:scale-110", avatar === option ? MEMBER_COLORS[color].chip + " ring-2 ring-honey-500" : "bg-dune-100")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
