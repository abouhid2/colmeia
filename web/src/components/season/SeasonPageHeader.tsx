import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { seasonRange } from "../goal/goalCopy";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { SeasonActions } from "./SeasonActions";

interface SeasonPageHeaderProps {
  season: Season;
  isCurrent: boolean;
  search: string;
  confirmingDelete: boolean;
  onSelect(): void;
  onEdit(): void;
  onClose(): void;
  onReopen(): void;
  onDelete(): void;
}

export function SeasonPageHeader({ season, isCurrent, search, confirmingDelete, onSelect, ...actions }: SeasonPageHeaderProps) {
  return (
    <header className="space-y-3">
      <Link to={{ pathname: "/estacoes", search }} className="inline-flex items-center gap-1 text-sm font-semibold text-honey-700 hover:underline">
        <ArrowLeft className="size-4" /> Estações
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{season.name}</h1>
            {isClosed(season)
              ? <Badge>Encerrada</Badge>
              : <Badge tone="bg-leaf-100 text-leaf-700">Em andamento</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{seasonRange(season)}</p>
        </div>
        {isCurrent
          ? <Badge tone="bg-honey-100 text-honey-700" icon={<Check className="size-3" />}>Você está aqui</Badge>
          : <Button variant="secondary" size="sm" onClick={onSelect}>Usar esta estação</Button>}
      </div>
      <div className="border-t border-line pt-3">
        <SeasonActions season={season} confirmingDelete={confirmingDelete} {...actions} />
      </div>
    </header>
  );
}
