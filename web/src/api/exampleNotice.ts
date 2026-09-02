import type { KeyValueStore } from "./storage";

export const EXAMPLE_NOTICE_KEY = "colmeia.exampleNoticeDismissed";

/**
 * The banner over a sandbox colmeia says it once. Whoever dismissed it has read
 * it, so this browser keeps quiet from then on, in every example colmeia.
 */
export function isExampleNoticeDismissed(store: KeyValueStore): boolean {
  return store.getItem(EXAMPLE_NOTICE_KEY) === "true";
}

export function dismissExampleNotice(store: KeyValueStore): void {
  store.setItem(EXAMPLE_NOTICE_KEY, "true");
}
