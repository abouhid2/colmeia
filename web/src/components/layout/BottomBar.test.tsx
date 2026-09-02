import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { exampleColmeia, renderInColmeia } from "../../test/colmeia";
import { BottomBar } from "./BottomBar";

afterEach(cleanup);

describe("BottomBar", () => {
  it("keeps the fifth slot for \"Mais\" while more screens are on than fit", async () => {
    const screen = renderInColmeia(await exampleColmeia(true), <BottomBar />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Mais" })).not.toBeNull());
    expect(screen.queryAllByRole("link").map((link) => link.textContent)).toEqual([
      "Início", "Tarefas", "Compras", "Família",
    ]);
  });

  it("gives the fifth slot to the last screen once five are all there is", async () => {
    const colmeia = await exampleColmeia(true);
    await colmeia.api.members.update(colmeia.member.id, { navPreferences: { order: [], hidden: [ "shopping" ] } });

    const screen = renderInColmeia(colmeia, <BottomBar />);

    await waitFor(() => expect(screen.queryAllByRole("link").map((link) => link.textContent)).toEqual([
      "Início", "Tarefas", "Família", "Conquistas", "Estações",
    ]));
    expect(screen.queryByRole("button", { name: "Mais" })).toBeNull();
  });

  it("follows the order this person arranged", async () => {
    const colmeia = await exampleColmeia(true);
    await colmeia.api.members.update(colmeia.member.id, {
      navPreferences: { order: [ "seasons", "home" ], hidden: [] },
    });

    const screen = renderInColmeia(colmeia, <BottomBar />);

    await waitFor(() => expect(screen.queryAllByRole("link").map((link) => link.textContent)).toEqual([
      "Estações", "Início", "Tarefas", "Compras",
    ]));
    expect(screen.getByRole("button", { name: "Mais" })).not.toBeNull();
  });
});
