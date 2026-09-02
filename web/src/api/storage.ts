export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
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
