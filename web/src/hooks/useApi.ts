import { createContext, useContext } from "react";
import type { ColmeiaApi } from "../api";

export const ApiContext = createContext<ColmeiaApi | null>(null);

export function useApi(): ColmeiaApi {
  const api = useContext(ApiContext);
  if (!api) throw new Error("useApi must be used inside AppProviders");
  return api;
}
