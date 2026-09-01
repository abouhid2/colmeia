import type { Priority } from "./types";

interface PriorityMeta {
  label: string;
  rank: number;
  tone: string;
  dot: string;
}

export const PRIORITIES: Record<Priority, PriorityMeta> = {
  urgent: { label: "Urgente", rank: 0, tone: "bg-berry-100 text-berry-700", dot: "bg-berry-500" },
  high: { label: "Alta", rank: 1, tone: "bg-pollen-100 text-pollen-700", dot: "bg-pollen-500" },
  medium: { label: "Normal", rank: 2, tone: "bg-honey-100 text-honey-700", dot: "bg-honey-500" },
  low: { label: "Baixa", rank: 3, tone: "bg-dune-100 text-dune-700", dot: "bg-dune-500" },
};

export const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high", "urgent"];
