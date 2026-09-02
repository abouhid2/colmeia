import type { MemberStats } from "../../domain/memberStats";

interface Tile {
  label: string;
  value: string;
  hint?: string;
}

function buildTiles(stats: MemberStats): Tile[] {
  return [
    { label: "Tarefas feitas", value: String(stats.tasksCount) },
    { label: "Pontos no total", value: String(stats.points) },
    { label: "Nota média", value: stats.averageRating === null ? "—" : stats.averageRating.toFixed(1), hint: "recebida" },
    { label: "Avaliações feitas", value: String(stats.reviewsGiven) },
  ];
}

export function MemberStatTiles({ stats }: { stats: MemberStats }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {buildTiles(stats).map((tile) => (
        <li key={tile.label} className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="font-display text-3xl font-bold tabular-nums">{tile.value}</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {tile.label}
            {tile.hint && <span className="text-ink-faint"> {tile.hint}</span>}
          </p>
        </li>
      ))}
    </ul>
  );
}
