import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  tone?: "neutral" | "danger";
}

export function IconButton({ label, icon, tone = "neutral", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full text-ink-faint transition-colors",
        tone === "danger" ? "hover:bg-berry-100 hover:text-berry-700" : "hover:bg-dune-100 hover:text-ink",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
