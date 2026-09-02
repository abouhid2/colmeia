import { AVATAR_OPTIONS, MEMBER_COLORS } from "../../domain/memberColors";
import type { MemberColor } from "../../domain/types";
import { cn } from "../../lib/cn";
import { ColorPicker } from "./ColorPicker";

interface AvatarPickerProps {
  avatar: string;
  color: MemberColor;
  onAvatar(avatar: string): void;
  onColor(color: MemberColor): void;
}

export function AvatarPicker({ avatar, color, onAvatar, onColor }: AvatarPickerProps) {
  return (
    <div className="space-y-3">
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
      <ColorPicker color={color} onColor={onColor} />
    </div>
  );
}
