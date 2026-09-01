import type { ColmeiaApi } from "./client";
import { HttpApi } from "./httpApi";
import { LocalApi } from "./localApi";
import { buildDemoState } from "./seed";

/** With VITE_API_URL the app talks to Rails; without it, everything lives in this browser. */
export function createApi(): ColmeiaApi {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) return new HttpApi(apiUrl);
  return new LocalApi(window.localStorage, { seed: buildDemoState });
}

export type { ColmeiaApi } from "./client";
