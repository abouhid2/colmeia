import { describe, expect, it } from "vitest";
import type { Completion } from "../../domain/types";
import { logDoneMessage } from "./logDoneCopy";

const completion = (overrides: Partial<Completion> = {}): Completion => ({
  id: 1, taskId: 2, memberId: 3, reviewerId: null, status: "approved", rating: null,
  pointsAwarded: 15, multiplier: 1, taskTitle: "Trocar a lâmpada", taskPoints: 15,
  completedAt: "2026-08-14T18:30:00.000Z", reviewedAt: null, ...overrides,
});

describe("logDoneMessage", () => {
  it("says what was earned and which day it counts on", () => {
    expect(logDoneMessage(completion(), "Ana", "14 de ago")).toBe("+15 pontos para Ana, contando em 14 de ago.");
  });

  it("leaves the day out when the work was done today", () => {
    expect(logDoneMessage(completion(), "Ana", null)).toBe("+15 pontos para Ana.");
  });

  it("says the points are still waiting when the task needs a rating", () => {
    const pending = completion({ status: "pending", pointsAwarded: 0 });

    expect(logDoneMessage(pending, "Ana", "14 de ago"))
      .toBe("Registrado em 14 de ago. Agora outra pessoa dá a nota e libera os 15 pontos.");
    expect(logDoneMessage(pending, "Ana", null))
      .toBe("Registrado. Agora outra pessoa dá a nota e libera os 15 pontos.");
  });
});
