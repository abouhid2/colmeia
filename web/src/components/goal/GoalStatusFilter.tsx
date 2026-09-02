import type { GoalStatusFilter as StatusFilter } from "../../domain/goalBoard";
import { Segmented } from "../ui/Segmented";

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "upcoming", label: "Futuras" },
  { value: "reached", label: "Batidas" },
  { value: "missed", label: "Perdidas" },
];

interface GoalStatusFilterProps {
  value: StatusFilter;
  onChange(value: StatusFilter): void;
}

/** Which situations the lists below show. The roteiro keeps the whole estação. */
export function GoalStatusFilter({ value, onChange }: GoalStatusFilterProps) {
  return <Segmented label="Situação da meta" size="sm" options={OPTIONS} value={value} onChange={onChange} />;
}
