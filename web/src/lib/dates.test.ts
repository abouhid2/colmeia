import { describe, expect, it } from "vitest";
import { completedLabel, fromDateAndTimeInput, momentPhrase, toIsoDate, toTimeInput } from "./dates";

const now = new Date(2026, 7, 20, 9, 15);

describe("completedLabel", () => {
  it("stays relative while the completion is still from today", () => {
    expect(completedLabel(new Date(2026, 7, 20, 7, 15).toISOString(), now)).toBe("há 2 horas");
  });

  it("names the day and the hour once it is not today any more", () => {
    expect(completedLabel(new Date(2026, 7, 14, 18, 30).toISOString(), now)).toBe("14 de ago, 18:30");
  });

  it("names the day for yesterday too, however few hours ago it was", () => {
    expect(completedLabel(new Date(2026, 7, 19, 23, 50).toISOString(), now)).toBe("19 de ago, 23:50");
  });
});

describe("the native date and time inputs", () => {
  it("splits a moment into the two values the inputs want", () => {
    const moment = new Date(2026, 7, 14, 18, 30);

    expect(toIsoDate(moment)).toBe("2026-08-14");
    expect(toTimeInput(moment)).toBe("18:30");
  });

  it("reads the pair back as the same local moment", () => {
    expect(fromDateAndTimeInput("2026-08-14", "18:30")).toEqual(new Date(2026, 7, 14, 18, 30));
  });

  it("gives an invalid date when either half is missing", () => {
    expect(fromDateAndTimeInput("", "18:30").getTime()).toBeNaN();
    expect(fromDateAndTimeInput("2026-08-14", "").getTime()).toBeNaN();
  });
});

describe("momentPhrase", () => {
  it("reads as part of a sentence", () => {
    expect(momentPhrase(new Date(2026, 7, 14, 18, 30))).toBe("14 de ago às 18:30");
  });
});
