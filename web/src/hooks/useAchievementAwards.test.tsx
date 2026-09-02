import { cleanup, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toIsoDate } from "../lib/dates";
import type { Member } from "../domain/types";
import { exampleColmeia, renderInColmeia } from "../test/colmeia";
import { useAchievementSync, useMemberAwards } from "./useAchievementAwards";
import { useMemberAchievements } from "./useMemberAchievements";

afterEach(cleanup);

/** The profile and the ledger side by side, both fed by the same colmeia. */
function AchievementProbe({ member }: { member: Member }) {
  useAchievementSync(member.id);
  const { unlocked } = useMemberAchievements(member);
  const awards = useMemberAwards(member.id);

  return (
    <>
      <ul aria-label="profile">
        {unlocked.map((record) => <li key={record.id}>{record.id}</li>)}
      </ul>
      <ul aria-label="ledger">
        {awards.map((award) => <li key={award.id}>{`${award.key}:${award.completionId}`}</li>)}
      </ul>
    </>
  );
}

describe("useAchievementSync", () => {
  it("writes down a badge earned in an estação other than the one on screen", async () => {
    const colmeia = await exampleColmeia(true);
    const today = toIsoDate(new Date());
    const other = await colmeia.api.seasons.create({ name: "Mutirão do quintal", startsOn: today, endsOn: null });
    const task = await colmeia.api.tasks.create({
      seasonId: other.id, title: "Apagar o fogo do fogão", description: null, points: 20,
      priority: "urgent", recurrence: "none", intervalDays: null, weekdays: [], dueOn: null,
      requiresReview: false, kidFriendly: false, assigneeIds: [], createdById: colmeia.member.id,
    });
    const { completion } = await colmeia.api.tasks.complete(task.id, colmeia.member.id);

    const screen = renderInColmeia(colmeia, <AchievementProbe member={colmeia.member} />);

    const profile = screen.getByRole("list", { name: "profile" });
    await waitFor(() => expect(within(profile).getByText("urgentTask")).not.toBeNull());

    const ledger = screen.getByRole("list", { name: "ledger" });
    await waitFor(() => expect(within(ledger).getByText(`urgentTask:${completion.id}`)).not.toBeNull());
  });
});
