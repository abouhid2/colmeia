import { addDays, addMinutes, subDays, subMinutes } from "date-fns";
import { describe, expect, it } from "vitest";
import { completedAtError, MAX_BACKDATE_DAYS } from "./completionMoment";

const now = new Date(2026, 7, 20, 9, 15);

describe("completedAtError", () => {
  it("accepts a moment already past", () => {
    expect(completedAtError(subDays(now, 3), now)).toBeNull();
    expect(completedAtError(subMinutes(now, 1), now)).toBeNull();
  });

  it("refuses the future", () => {
    expect(completedAtError(addDays(now, 1), now)).toBe("Essa data está no futuro");
  });

  it("tolerates a clock a minute ahead of the server's", () => {
    expect(completedAtError(addMinutes(now, 1), now)).toBeNull();
    expect(completedAtError(addMinutes(now, 5), now)).toBe("Essa data está no futuro");
  });

  it("refuses anything further back than a year, and accepts the year itself", () => {
    expect(completedAtError(subDays(now, MAX_BACKDATE_DAYS), now)).toBeNull();
    expect(completedAtError(subDays(now, MAX_BACKDATE_DAYS + 1), now)).toBe("Só dá para registrar até um ano atrás");
  });

  it("refuses a date it cannot read", () => {
    expect(completedAtError(new Date("ontem"), now)).toBe("Não deu para entender essa data");
  });
});
