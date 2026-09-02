import type { GoalWithProgress } from "../../domain/goalBoard";
import type { Goal } from "../../domain/types";
import { GoalSummaryCard } from "./GoalSummaryCard";

interface GoalGridProps {
  items: GoalWithProgress[];
  onEdit(goal: Goal): void;
  readOnly?: boolean;
}

/** The one grid every list of metas uses, so they all read the same. */
export function GoalGrid({ items, onEdit, readOnly = false }: GoalGridProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <GoalSummaryCard key={item.goal.id} item={item} readOnly={readOnly} onEdit={() => onEdit(item.goal)} />
      ))}
    </ul>
  );
}
