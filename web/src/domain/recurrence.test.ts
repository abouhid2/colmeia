import { describe, expect, it } from "vitest";
import { nextDueOn, recurrenceLabel } from "./recurrence";

describe("nextDueOn", () => {
  const from = new Date(2026, 0, 31);

  it("is null for one-off tasks", () => {
    expect(nextDueOn("none", null, from)).toBeNull();
  });

  it("rolls forward by the period from the completion day", () => {
    expect(nextDueOn("daily", null, from)).toBe("2026-02-01");
    expect(nextDueOn("weekly", null, from)).toBe("2026-02-07");
    expect(nextDueOn("monthly", null, from)).toBe("2026-02-28");
    expect(nextDueOn("custom", 3, from)).toBe("2026-02-03");
  });
});

describe("recurrenceLabel", () => {
  it("spells out custom intervals", () => {
    expect(recurrenceLabel({ recurrence: "custom", intervalDays: 3 })).toBe("A cada 3 dias");
    expect(recurrenceLabel({ recurrence: "weekly", intervalDays: null })).toBe("Semanal");
  });
});
