import { MEMBER_COLORS, MEMBER_COLOR_OPTIONS } from "../../domain/memberColors";
import type { MemberColor } from "../../domain/types";
import { cn } from "../../lib/cn";

interface ColorPickerProps {
  color: MemberColor;
  onColor(color: MemberColor): void;
}

/** The six colours somebody can wear, in the avatar and in the honeycomb. */
export function ColorPicker({ color, onColor }: ColorPickerProps) {
  return (
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
          className={cn(
            "size-7 rounded-full transition-transform hover:scale-110",
            MEMBER_COLORS[option].swatch,
            color === option && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
          )}
        />
      ))}
    </div>
  );
}
