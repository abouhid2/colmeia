import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-honey-100 text-honey-700">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
