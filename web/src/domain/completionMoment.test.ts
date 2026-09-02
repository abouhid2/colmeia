import { addDays, addMinutes, subDays, subMinutes } from "date-fns";
import { describe, expect, it } from "vitest";
import { completedAtError, MAX_BACKDATE_DAYS } from "./completionMoment";

const now = new Date(2026, 7, 20, 9, 15);
/** An estação old enough that its own start never gets in the way. */
const ANCIENT = "2020-01-01";

describe("completedAtError", () => {
  it("accepts a moment already past", () => {
    expect(completedAtError(subDays(now, 3), now, ANCIENT)).toBeNull();
    expect(completedAtError(subMinutes(now, 1), now, ANCIENT)).toBeNull();
  });

  it("refuses the future", () => {
    expect(completedAtError(addDays(now, 1), now, ANCIENT)).toBe("Essa data está no futuro");
  });

  it("tolerates a clock a minute ahead of the server's", () => {
    expect(completedAtError(addMinutes(now, 1), now, ANCIENT)).toBeNull();
    expect(completedAtError(addMinutes(now, 5), now, ANCIENT)).toBe("Essa data está no futuro");
  });

  it("refuses anything further back than a year, and accepts the year itself", () => {
    expect(completedAtError(subDays(now, MAX_BACKDATE_DAYS), now, ANCIENT)).toBeNull();
    expect(completedAtError(subDays(now, MAX_BACKDATE_DAYS + 1), now, ANCIENT)).toBe("Só dá para registrar até um ano atrás");
  });

  it("refuses a date it cannot read", () => {
    expect(completedAtError(new Date("ontem"), now, ANCIENT)).toBe("Não deu para entender essa data");
  });

  it("refuses a moment from before the estação started", () => {
    expect(completedAtError(new Date(2026, 7, 9, 20, 0), now, "2026-08-10"))
      .toBe("Essa data é de antes da estação começar");
  });

  it("accepts a moment from the very day the estação started", () => {
    expect(completedAtError(new Date(2026, 7, 10, 0, 30), now, "2026-08-10")).toBeNull();
  });

  it("names the estação, not the year, when the date is outside both", () => {
    expect(completedAtError(subDays(now, 400), now, "2026-08-10"))
      .toBe("Essa data é de antes da estação começar");
  });

  it("skips the estação bound when there is none to answer for", () => {
    expect(completedAtError(subDays(now, 400), now, null)).toBe("Só dá para registrar até um ano atrás");
  });
});
