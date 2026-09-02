import { describe, expect, it } from "vitest";
import { dismissExampleNotice, EXAMPLE_NOTICE_KEY, isExampleNoticeDismissed } from "./exampleNotice";
import type { KeyValueStore } from "./storage";

class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe("the example notice", () => {
  it("shows itself to a browser that never saw it", () => {
    expect(isExampleNoticeDismissed(new MemoryStore())).toBe(false);
  });

  it("stays dismissed once somebody has read it", () => {
    const store = new MemoryStore();

    dismissExampleNotice(store);

    expect(isExampleNoticeDismissed(store)).toBe(true);
    expect(store.getItem(EXAMPLE_NOTICE_KEY)).toBe("true");
  });

  it("ignores anything else somebody left under the key", () => {
    const store = new MemoryStore();
    store.setItem(EXAMPLE_NOTICE_KEY, "sim");

    expect(isExampleNoticeDismissed(store)).toBe(false);
  });
});
