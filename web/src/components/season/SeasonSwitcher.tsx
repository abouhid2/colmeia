import { CalendarRange, Check, Settings2 } from "lucide-react";
import { Link, useLocation } from "react-router";
import { isClosed } from "../../domain/seasons";
import type { Season } from "../../domain/types";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useSeason } from "../../hooks/useSeasonContext";
import { cn } from "../../lib/cn";
import { seasonRange, seasonStatus } from "../goal/goalCopy";
import { Dialog } from "../ui/Dialog";

/** Which championship the app is showing, and the way into the others. */
export function SeasonSwitcher({ compact = false }: { compact?: boolean }) {
  const { seasons, currentSeason, setCurrentSeasonId } = useSeason();
  const picker = useDisclosure();
  const { search } = useLocation();

  if (currentSeason === null) return null;

  const pick = (season: Season) => {
    setCurrentSeasonId(season.id);
    picker.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={picker.open}
        aria-label={`Estação: ${currentSeason.name}. Trocar de estação`}
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface text-left hover:bg-dune-100",
          compact ? "size-9 justify-center" : "w-full px-3 py-1.5",
        )}
      >
        <CalendarRange className="size-4 shrink-0 text-honey-700" aria-hidden />
        {!compact && (
          <span className="min-w-0 flex-1 text-sm leading-tight">
            <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-ink-faint">Estação</span>
            <span className="block truncate font-semibold">{currentSeason.name}</span>
          </span>
        )}
        {!compact && isClosed(currentSeason) && (
          <span className="shrink-0 rounded-full bg-dune-100 px-2 py-0.5 text-[0.625rem] font-semibold text-dune-700">encerrada</span>
        )}
      </button>

      <Dialog open={picker.isOpen} onClose={picker.close} title="Estações" description="Cada estação tem as suas tarefas, metas e ranking.">
        <ul className="space-y-2">
          {seasons.map((season) => (
            <li key={season.id}>
              <button
                type="button"
                onClick={() => pick(season)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left transition-colors",
                  season.id === currentSeason.id ? "border-honey-500 bg-honey-100" : "border-line hover:bg-dune-100",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{season.name}</p>
                  <p className="text-sm text-ink-soft">{seasonRange(season)} · {seasonStatus(season)}</p>
                </div>
                {season.id === currentSeason.id && <Check className="size-4 shrink-0 text-honey-700" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
        <Link
          to={{ pathname: "/estacoes", search }}
          onClick={picker.close}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-honey-700 hover:underline"
        >
          <Settings2 className="size-4" aria-hidden /> Gerenciar estações
        </Link>
      </Dialog>
    </>
  );
}
