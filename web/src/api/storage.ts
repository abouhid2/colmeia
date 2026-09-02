export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Stored JSON is only as good as the browser that wrote it: a half-written or
 *  hand-edited value reads as nothing rather than taking the app down. */
export function parseJson<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const fallback = new Map<string, string>();

/**
 * localStorage, except that private mode and blocked storage throw instead of
 * answering. Falling back to memory keeps the session alive for the tab.
 */
export function browserStore(): KeyValueStore {
  return {
    getItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return fallback.get(key) ?? null;
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        fallback.set(key, value);
      }
    },
    removeItem(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        fallback.delete(key);
      }
    },
  };
}
