import { useMemo, type ReactNode } from "react";
import { resolveSeason } from "../../domain/seasons";
import { useNow } from "../../hooks/useNow";
import { SeasonContext } from "../../hooks/useSeasonContext";
import { useSeasonList } from "../../hooks/useSeasons";
import { useSessionContext } from "../../hooks/useSessionContext";

/**
 * Which championship the app is looking at. The browser remembers the choice;
 * an estação that no longer exists falls back to the one that makes sense today.
 */
export function SeasonProvider({ children }: { children: ReactNode }) {
  const now = useNow();
  const { session, setCurrentSeasonId } = useSessionContext();
  const { seasons, isLoading } = useSeasonList();

  const value = useMemo(
    () => ({
      seasons,
      currentSeason: resolveSeason(seasons, session?.seasonId ?? null, now),
      setCurrentSeasonId,
      isLoading,
    }),
    [ seasons, session?.seasonId, now, setCurrentSeasonId, isLoading ],
  );

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}
