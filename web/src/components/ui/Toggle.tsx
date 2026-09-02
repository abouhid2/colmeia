import { cn } from "../../lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange(checked: boolean): void;
  label: string;
  hint?: string;
  /** Shown as it is, and not for turning: say why in the hint. */
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, hint, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border border-line px-3.5 py-3 text-left transition-colors hover:bg-dune-100",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
      )}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-sm text-ink-soft">{hint}</span>}
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-honey-500" : "bg-line-strong")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-surface shadow-card transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
