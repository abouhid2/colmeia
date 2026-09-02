import { cleanup, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NAV_KEYS, PINNED_NAV_KEY } from "../../domain/navigation";
import { exampleColmeia, renderInColmeia } from "../../test/colmeia";
import { AppShell } from "./AppShell";
import { SETTINGS_LABEL, SETTINGS_PATH } from "./navItems";

afterEach(cleanup);

describe("AppShell", () => {
  it("keeps Meus ajustes on the phone header when every screen that can hide is hidden", async () => {
    const colmeia = await exampleColmeia(true);
    await colmeia.api.members.update(colmeia.member.id, {
      navPreferences: { order: [], hidden: NAV_KEYS.filter((key) => key !== PINNED_NAV_KEY) },
    });

    const screen = renderInColmeia(colmeia, <AppShell />);

    // The header is the one part of the phone shell that no preference can empty.
    const header = await waitFor(() => screen.getByRole("banner"));
    const link = within(header).getByRole("link", { name: SETTINGS_LABEL });

    expect(link.getAttribute("href")).toContain(SETTINGS_PATH);
    expect(screen.queryByRole("button", { name: "Mais" })).toBeNull();
  });
});
