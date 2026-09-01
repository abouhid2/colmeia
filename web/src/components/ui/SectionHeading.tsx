import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function SectionHeading({ title, hint, action }: SectionHeadingProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {hint && <p className="text-sm text-ink-soft">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
