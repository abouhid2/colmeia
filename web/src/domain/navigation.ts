/** The screens the navigation can hold, in the order the app arranges them. */
export const NAV_KEYS = [ "home", "tasks", "shopping", "family", "achievements", "seasons" ] as const;

export type NavKey = (typeof NAV_KEYS)[number];

/** Início is the way back to everything else, so it never leaves the navigation. */
export const PINNED_NAV_KEY = "home";

/** How many slots the bar at the bottom of a phone has. */
export const BOTTOM_BAR_SLOTS = 5;

/** Which screens one person keeps, and in what order. Empty means the default. */
export interface NavPreferences {
  /** What this person arranged. Screens they never named come after. */
  order: NavKey[];
  hidden: NavKey[];
}

export function emptyNavPreferences(): NavPreferences {
  return { order: [], hidden: [] };
}

export function isNavKey(value: unknown): value is NavKey {
  return typeof value === "string" && (NAV_KEYS as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Known screens, once each, in the order they were given. */
function knownKeys(value: unknown): NavKey[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isNavKey).filter((key, index, keys) => keys.indexOf(key) === index);
}

/**
 * Same rules as NavPreferences.normalize in Ruby. A preference outlives the
 * release that wrote it, so anything unknown here comes from an older or a
 * newer app: it is dropped rather than kept, and Início never hides.
 */
export function normalizeNavPreferences(value: unknown): NavPreferences {
  const stored = isRecord(value) ? value : {};
  return {
    order: knownKeys(stored.order),
    hidden: knownKeys(stored.hidden).filter((key) => key !== PINNED_NAV_KEY),
  };
}

/** What this person arranged, then whatever the app added since, so a new
 *  screen shows up on its own without anybody asking for it. */
export function navOrder(preferences: NavPreferences): NavKey[] {
  return [ ...preferences.order, ...NAV_KEYS.filter((key) => !preferences.order.includes(key)) ];
}

export function isNavKeyVisible(preferences: NavPreferences, key: NavKey): boolean {
  return key === PINNED_NAV_KEY || !preferences.hidden.includes(key);
}

/** The whole order goes back, not just the part that moved: what somebody
 *  arranged should survive the day a new screen joins the list. */
export function withNavKeyMoved(preferences: NavPreferences, key: NavKey, step: -1 | 1): NavPreferences {
  const order = navOrder(preferences);
  const from = order.indexOf(key);
  const to = from + step;
  if (from === -1 || to < 0 || to >= order.length) return { ...preferences, order };

  const moved = [ ...order ];
  moved[from] = moved[to];
  moved[to] = key;
  return { ...preferences, order: moved };
}

export function withNavKeyVisible(preferences: NavPreferences, key: NavKey, visible: boolean): NavPreferences {
  const hidden = preferences.hidden.filter((candidate) => candidate !== key);
  const stays = visible || key === PINNED_NAV_KEY;
  return { order: navOrder(preferences), hidden: stays ? hidden : [ ...hidden, key ] };
}

/** Five slots at most on a phone: the fifth holds a screen only when it is the
 *  last one left, and otherwise opens the rest. */
export function splitBottomBar<T>(items: T[]): { tabs: T[]; overflow: T[] } {
  if (items.length <= BOTTOM_BAR_SLOTS) return { tabs: items, overflow: [] };
  return { tabs: items.slice(0, BOTTOM_BAR_SLOTS - 1), overflow: items.slice(BOTTOM_BAR_SLOTS - 1) };
}
