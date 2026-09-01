import { cn } from "../../lib/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 64 64" className="size-7" aria-hidden>
        <path d="M32 4 56 18v28L32 60 8 46V18z" className="fill-honey-500" />
        <path d="M32 16 44 23v14L32 44 20 37V23z" className="fill-paper" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">Colmeia</span>
    </span>
  );
}
