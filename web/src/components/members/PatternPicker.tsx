import { MEMBER_PATTERNS, MEMBER_PATTERN_OPTIONS } from "../../domain/memberPatterns";
import type { MemberColor, MemberPattern } from "../../domain/types";
import { cn } from "../../lib/cn";
import { MemberMark } from "./MemberMark";

interface PatternPickerProps {
  color: MemberColor;
  pattern: MemberPattern;
  onPattern(pattern: MemberPattern): void;
}

/** The seven ways somebody's share of the honeycomb can be drawn, each shown in
 *  the colour they are wearing right now. */
export function PatternPicker({ color, pattern, onPattern }: PatternPickerProps) {
  return (
    <div role="radiogroup" aria-label="Textura" className="flex flex-wrap gap-2">
      {MEMBER_PATTERN_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={pattern === option}
          aria-label={MEMBER_PATTERNS[option].label}
          title={MEMBER_PATTERNS[option].label}
          onClick={() => onPattern(option)}
          className={cn(
            "grid size-9 place-items-center rounded-full bg-dune-100 transition-transform hover:scale-110",
            pattern === option && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
          )}
        >
          <MemberMark member={{ color, pattern: option }} className="size-6" />
        </button>
      ))}
    </div>
  );
}
