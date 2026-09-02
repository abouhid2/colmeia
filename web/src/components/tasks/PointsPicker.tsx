import { LIMITS } from "../../domain/limits";
import { POINT_PRESETS } from "../../domain/points";
import { cn } from "../../lib/cn";
import { Input } from "../ui/Input";

interface PointsPickerProps {
  value: number;
  onChange(value: number): void;
}

export function PointsPicker({ value, onChange }: PointsPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label="Valores comuns" className="flex gap-1.5">
        {POINT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-pressed={value === preset}
            onClick={() => onChange(preset)}
            className={cn(
              "h-10 min-w-11 rounded-full border px-3 font-display text-sm font-bold tabular-nums transition-colors",
              value === preset ? "border-honey-500 bg-honey-200 text-honey-900" : "border-line-strong bg-surface text-ink-soft hover:bg-dune-100",
            )}
          >
            {preset}
          </button>
        ))}
      </div>
      <Input id="task-points" type="number" min={1} max={LIMITS.taskPoints} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-label="Outro valor" className="w-24" />
    </div>
  );
}
