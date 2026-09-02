import { createContext, useContext } from "react";
import type { Season } from "../domain/types";

export interface SeasonContextValue {
  /** Every estação of the colmeia, newest first. */
  seasons: Season[];
  /** The one the app is showing, or null while the colmeia has none. */
  currentSeason: Season | null;
  setCurrentSeasonId(id: number): void;
  isLoading: boolean;
}

export const SeasonContext = createContext<SeasonContextValue | null>(null);

export function useSeason(): SeasonContextValue {
  const context = useContext(SeasonContext);
  if (!context) throw new Error("useSeason must be used inside AppProviders");
  return context;
}
