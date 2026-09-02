import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
}

/** The pill shape every filter row in the app uses. ARIA is the caller's job:
 *  some of these are radios in a group, others are standalone switches. */
export function FilterChip({ selected, className, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
        selected ? "border-honey-500 bg-honey-200 text-honey-900" : "border-line bg-surface text-ink-soft hover:bg-dune-100 hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
