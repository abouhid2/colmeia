import type { Season } from "../../domain/types";

interface SeasonNumbersProps {
  season: Season;
  /** Approved points scored inside it. */
  points: number;
  /** Days it ran, counting the day it opened. */
  days: number;
}

export function SeasonNumbers({ season, points, days }: SeasonNumbersProps) {
  const tiles = [
    { label: season.tasksCount === 1 ? "Tarefa" : "Tarefas", value: season.tasksCount },
    { label: season.completionsCount === 1 ? "Conclusão" : "Conclusões", value: season.completionsCount },
    { label: "Pontos", value: points },
    { label: days === 1 ? "Dia" : "Dias", value: days },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <li key={tile.label} className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="font-display text-3xl font-bold tabular-nums">{tile.value}</p>
          <p className="mt-0.5 text-sm text-ink-soft">{tile.label}</p>
        </li>
      ))}
    </ul>
  );
}
