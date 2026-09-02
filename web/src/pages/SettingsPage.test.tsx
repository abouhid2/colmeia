import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Member } from "../domain/types";
import { exampleColmeia, renderInColmeia } from "../test/colmeia";
import { SettingsPage } from "./SettingsPage";

afterEach(cleanup);

describe("SettingsPage", () => {
  it("saves the texture whoever is looking picks for themselves", async () => {
    const colmeia = await exampleColmeia(true);
    const screen = renderInColmeia(colmeia, <SettingsPage />);

    await waitFor(() => expect(screen.queryByText("Minha cor e textura")).not.toBeNull());
    fireEvent.click(screen.getByRole("radio", { name: "Ondas" }));

    await waitFor(async () => {
      const saved: Member[] = await colmeia.api.members.list();
      expect(saved.find((member) => member.id === colmeia.member.id)?.pattern).toBe("waves");
    });
  });

  it("saves the colour the same way, without a button to press", async () => {
    const colmeia = await exampleColmeia(true);
    const screen = renderInColmeia(colmeia, <SettingsPage />);

    await waitFor(() => expect(screen.queryByText("Minha cor e textura")).not.toBeNull());
    fireEvent.click(screen.getByRole("radio", { name: "Folha" }));

    await waitFor(async () => {
      const saved: Member[] = await colmeia.api.members.list();
      expect(saved.find((member) => member.id === colmeia.member.id)?.color).toBe("leaf");
    });
  });
});
