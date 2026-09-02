import { ChevronDown, ChevronRight } from "lucide-react";
import type { GoalWithProgress } from "../../domain/goalBoard";
import type { Goal } from "../../domain/types";
import { useDisclosure } from "../../hooks/useDisclosure";
import { GoalGrid } from "./GoalGrid";

interface ClosedGoalsSectionProps {
  items: GoalWithProgress[];
  onEdit(goal: Goal): void;
  readOnly?: boolean;
}

/** Metas whose days are behind us. Folded away, because the estação has moved on. */
export function ClosedGoalsSection({ items, onEdit, readOnly = false }: ClosedGoalsSectionProps) {
  const panel = useDisclosure();
  if (items.length === 0) return null;

  return (
    <section>
      <button
        type="button"
        onClick={panel.isOpen ? panel.close : panel.open}
        aria-expanded={panel.isOpen}
        className="mb-3 flex items-center gap-1.5 rounded-full text-lg font-bold tracking-tight hover:text-honey-700"
      >
        {panel.isOpen ? <ChevronDown className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
        Encerradas
        <span className="font-semibold tabular-nums text-ink-soft">{items.length}</span>
      </button>
      {panel.isOpen && <GoalGrid items={items} onEdit={onEdit} readOnly={readOnly} />}
    </section>
  );
}
