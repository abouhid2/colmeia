import { Star } from "lucide-react";
import { useState } from "react";
import { MAX_RATING } from "../../domain/points";
import { cn } from "../../lib/cn";
import { RATING_LABELS } from "./ratingLabels";

interface StarRatingProps {
  value: number | null;
  onChange(value: number): void;
  disabled?: boolean;
}

export function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Nota" className="flex" onMouseLeave={() => setHovered(null)}>
        {Array.from({ length: MAX_RATING }, (_, index) => index + 1).map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
            disabled={disabled}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            onClick={() => onChange(star)}
            className="rounded-full p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Star className={cn("size-7 transition-colors", shown !== null && star <= shown ? "fill-honey-400 text-honey-500" : "text-line-strong")} />
          </button>
        ))}
      </div>
      <span className="min-w-24 text-sm text-ink-soft" aria-live="polite">{shown ? RATING_LABELS[shown] : ""}</span>
    </div>
  );
}
