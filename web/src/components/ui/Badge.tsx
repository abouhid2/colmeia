import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface BadgeProps {
  tone?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "bg-dune-100 text-dune-700", icon, children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", tone, className)}>
      {icon}
      {children}
    </span>
  );
}
