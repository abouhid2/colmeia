import { useCallback, useState } from "react";
import { cn } from "../../lib/cn";

const COLLAPSED_LINES = "line-clamp-2";

/** Two lines by default. The toggle only shows up when something is actually hidden. */
export function TaskDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // Measured on the real DOM. The paragraph is keyed by its text, so new text remounts it and measures again.
  const measure = useCallback((element: HTMLParagraphElement | null) => {
    if (element) setOverflows(element.scrollHeight > element.clientHeight + 1);
  }, []);

  return (
    <div>
      <p key={text} ref={measure} className={cn("whitespace-pre-line text-sm text-ink-soft", !expanded && COLLAPSED_LINES)}>{text}</p>
      {(overflows || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="mt-1 text-xs font-semibold text-honey-700 hover:underline"
        >
          {expanded ? "Mostrar menos" : "Mostrar mais"}
        </button>
      )}
    </div>
  );
}
