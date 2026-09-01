import { describe, expect, it } from "vitest";
import { toCamelKeys, toSnakeKeys } from "./keys";

describe("key conversion", () => {
  it("round-trips nested objects and arrays", () => {
    const camel = { taskId: 1, items: [{ addedById: 2, purchasedAt: null }] };
    const snake = toSnakeKeys<Record<string, unknown>>(camel);
    expect(snake).toEqual({ task_id: 1, items: [{ added_by_id: 2, purchased_at: null }] });
    expect(toCamelKeys(snake)).toEqual(camel);
  });
});
