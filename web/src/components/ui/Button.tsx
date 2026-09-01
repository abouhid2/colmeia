import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-honey-500 text-honey-900 hover:bg-honey-400 active:bg-honey-600",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-dune-100",
  ghost: "text-ink-soft hover:bg-dune-100 hover:text-ink",
  danger: "bg-berry-100 text-berry-700 hover:bg-berry-500 hover:text-white",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

export function Button({ variant = "primary", size = "md", loading = false, icon, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}
