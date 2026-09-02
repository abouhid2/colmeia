import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import { addDays } from "date-fns";
import { afterEach, describe, expect, it } from "vitest";
import { fromIsoDate, toIsoDate } from "../lib/dates";
import { exampleColmeia, renderInColmeia } from "../test/colmeia";
import { GoalsPage } from "./GoalsPage";

afterEach(cleanup);

/** The example colmeia plus one meta whose days are already behind it. */
async function colmeiaWithAClosedGoal() {
  const colmeia = await exampleColmeia(true);
  const season = colmeia.seasons.find((candidate) => candidate.closedAt === null);
  if (season === undefined) throw new Error("the example needs a running estação");

  await colmeia.api.goals.create({
    seasonId: season.id,
    title: "Maratona da primeira semana",
    targetPoints: 500,
    memberIds: [],
    startsOn: season.startsOn,
    endsOn: toIsoDate(addDays(fromIsoDate(season.startsOn), 1)),
  });
  return colmeia;
}

describe("GoalsPage", () => {
  it("splits the metas of the estação by who they are for", async () => {
    const screen = renderInColmeia(await exampleColmeia(true), <GoalsPage />);

    // The roteiro only appears once the metas are in, so it is what to wait for.
    await waitFor(() => expect(screen.getByRole("heading", { name: "Roteiro da estação" })).not.toBeNull());
    expect(screen.getByRole("heading", { name: "Da colmeia inteira" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Individuais e de grupos" })).not.toBeNull();
    // The reward of a meta da colmeia, and one of a meta somebody is named in.
    expect(screen.queryAllByText(/Pizza e filme no sábado/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Sorvete duplo/).length).toBeGreaterThan(0);
  });

  it("narrows the lists to one situation without touching the roteiro", async () => {
    const screen = renderInColmeia(await exampleColmeia(true), <GoalsPage />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Roteiro da estação" })).not.toBeNull());

    fireEvent.click(screen.getByRole("radio", { name: "Futuras" }));

    // Only the two windows still ahead are left in the lists.
    expect(screen.queryAllByText(/Recompensa: Fim de semana na praia/)).toHaveLength(1);
    expect(screen.queryAllByText(/Recompensa: Pizza e filme no sábado/)).toHaveLength(0);
    expect(screen.getByText("Nenhuma meta nesse filtro")).not.toBeNull();
    // The roteiro still draws the whole estação, filter or no filter.
    expect(screen.getByRole("button", { name: /^Pizza e filme no sábado,/ })).not.toBeNull();
  });

  it("folds away the metas whose days are over until somebody asks", async () => {
    const screen = renderInColmeia(await colmeiaWithAClosedGoal(), <GoalsPage />);

    const toggle = await waitFor(() => screen.getByRole("button", { name: /Encerradas/ }));
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText(/Recompensa: Maratona da primeira semana/)).toBeNull();

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/Recompensa: Maratona da primeira semana/)).not.toBeNull();
  });
});
