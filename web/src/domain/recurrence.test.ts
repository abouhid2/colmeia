import { describe, expect, it } from "vitest";
import { nextDueOn, recurrenceLabel, weekdaysPhrase } from "./recurrence";
import type { Recurrence } from "./types";

const repeats = (recurrence: Recurrence, intervalDays: number | null = null, weekdays: number[] = []) => ({ recurrence, intervalDays, weekdays });

describe("nextDueOn", () => {
  const from = new Date(2026, 0, 31);

  it("is null for one-off tasks", () => {
    expect(nextDueOn(repeats("none"), from)).toBeNull();
  });

  it("rolls forward by the period from the completion day", () => {
    expect(nextDueOn(repeats("daily"), from)).toBe("2026-02-01");
    expect(nextDueOn(repeats("weekly"), from)).toBe("2026-02-07");
    expect(nextDueOn(repeats("monthly"), from)).toBe("2026-02-28");
    expect(nextDueOn(repeats("custom", 3), from)).toBe("2026-02-03");
  });

  it("jumps to the next chosen day of the week", () => {
    // 31 Jan 2026 is a Saturday: Tuesday and Thursday put it on 3 Feb.
    expect(nextDueOn(repeats("weekdays", null, [ 2, 4 ]), from)).toBe("2026-02-03");
  });

  it("comes back a week later when the only chosen day is the day it was done", () => {
    expect(nextDueOn(repeats("weekdays", null, [ 6 ]), from)).toBe("2026-02-07");
  });

  it("has no next date with no day chosen", () => {
    expect(nextDueOn(repeats("weekdays"), from)).toBeNull();
  });
});

describe("recurrenceLabel", () => {
  it("spells out custom intervals", () => {
    expect(recurrenceLabel(repeats("custom", 3))).toBe("A cada 3 dias");
    expect(recurrenceLabel(repeats("weekly"))).toBe("Semanal");
  });

  it("lists the chosen days of the week", () => {
    expect(recurrenceLabel(repeats("weekdays", null, [ 6, 2, 4 ]))).toBe("ter, qui e sáb");
  });
});

describe("weekdaysPhrase", () => {
  it("reads one day, two days and a list the same way", () => {
    expect(weekdaysPhrase([ 1 ])).toBe("seg");
    expect(weekdaysPhrase([ 3, 1 ])).toBe("seg e qua");
    expect(weekdaysPhrase([])).toBe("");
  });
});
