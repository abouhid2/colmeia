import { weekdayName, weekdayShort, WEEKDAY_OPTIONS } from "../../domain/recurrence";
import { cn } from "../../lib/cn";

interface WeekdayPickerProps {
  value: number[];
  onChange(weekdays: number[]): void;
}

/** The seven days as switches: a task can land on as many of them as it needs. */
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const toggle = (day: number) => {
    onChange(value.includes(day) ? value.filter((chosen) => chosen !== day) : [ ...value, day ].sort((left, right) => left - right));
  };

  return (
    <div role="group" aria-label="Dias da semana" className="grid grid-cols-7 gap-1">
      {WEEKDAY_OPTIONS.map((day) => {
        const chosen = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            aria-pressed={chosen}
            aria-label={weekdayName(day)}
            onClick={() => toggle(day)}
            className={cn(
              "h-11 rounded-full border text-sm font-semibold transition-colors",
              chosen ? "border-honey-500 bg-honey-100 text-honey-900" : "border-line text-ink-soft hover:text-ink",
            )}
          >
            {weekdayShort(day)}
          </button>
        );
      })}
    </div>
  );
}
