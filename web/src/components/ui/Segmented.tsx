import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: SegmentedOption<T>[];
  value: NoInfer<T>;
  onChange(value: NoInfer<T>): void;
  size?: "sm" | "md";
  className?: string;
}

export function Segmented<T extends string>({ label, options, value, onChange, size = "md", className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-dune-100 p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full font-semibold transition-colors",
              size === "sm" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              selected ? "bg-surface text-ink shadow-card" : "text-ink-soft hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
