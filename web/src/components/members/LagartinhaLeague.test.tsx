import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { rankMembers } from "../../domain/leaderboard";
import type { Completion, Member } from "../../domain/types";
import { exampleColmeia, renderInColmeia } from "../../test/colmeia";
import { LagartinhaLeague } from "./LagartinhaLeague";

afterEach(cleanup);

async function standingsOf(lagartinhasEnabled: boolean) {
  const colmeia = await exampleColmeia(lagartinhasEnabled);
  const members: Member[] = await colmeia.api.members.list();
  const completions: Completion[] = await colmeia.api.completions.list();
  return { colmeia, standings: rankMembers(members, completions) };
}

describe("LagartinhaLeague", () => {
  it("gives the children a table of their own while the colmeia has them", async () => {
    const { colmeia, standings } = await standingsOf(true);
    const screen = renderInColmeia(colmeia, <LagartinhaLeague standings={standings} />);

    await waitFor(() => expect(screen.queryByText("Lagartinhas")).not.toBeNull());
    expect(screen.queryByText("Duda")).not.toBeNull();
  });

  it("is not there at all once the switch is off, Duda still being one", async () => {
    const { colmeia, standings } = await standingsOf(false);
    const screen = renderInColmeia(colmeia, <LagartinhaLeague standings={standings} />);

    expect(standings.some((standing) => standing.member.kind === "lagartinha")).toBe(true);
    await waitFor(() => expect(screen.queryByText("O ranking só entre as crianças.")).toBeNull());
    expect(screen.queryByText("Lagartinhas")).toBeNull();
  });
});
