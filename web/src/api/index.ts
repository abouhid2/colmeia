import type { ColmeiaApi } from "./client";
import { HttpApi } from "./httpApi";
import { LocalApi } from "./localApi";
import { buildDemoState } from "./seed";
import { readSession } from "./session";
import { browserStore } from "./storage";

/** With VITE_API_URL the app talks to Rails; without it, everything lives in this browser. */
export function createApi(): ColmeiaApi {
  const store = browserStore();
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const api: ColmeiaApi = apiUrl ? new HttpApi(apiUrl) : new LocalApi(store, { seed: buildDemoState });
  // The colmeia the browser was last in, so the first render already has data.
  api.setInviteCode(readSession(store)?.inviteCode ?? null);
  return api;
}

export type { ColmeiaApi, StoredHousehold } from "./client";
export { DEMO_INVITE_CODE } from "./localState";
