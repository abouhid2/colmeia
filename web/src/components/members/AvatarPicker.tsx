import { AVATAR_OPTIONS, MEMBER_COLORS, MEMBER_COLOR_OPTIONS } from "../../domain/memberColors";
import type { MemberColor } from "../../domain/types";
import { cn } from "../../lib/cn";

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
      <div role="radiogroup" aria-label="Cor" className="flex gap-2">
        {MEMBER_COLOR_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={color === option}
            aria-label={MEMBER_COLORS[option].label}
            title={MEMBER_COLORS[option].label}
            onClick={() => onColor(option)}
            className={cn("size-7 rounded-full transition-transform hover:scale-110", MEMBER_COLORS[option].swatch, color === option && "ring-2 ring-ink ring-offset-2 ring-offset-surface")}
          />
        ))}
      </div>
    </div>
  );
}
