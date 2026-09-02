import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { exampleColmeia, renderInColmeia } from "../test/colmeia";
import { useLagartinhasEnabled } from "./useLagartinhas";

afterEach(cleanup);

function Answer() {
  return <p>{useLagartinhasEnabled() ? "tem lagartinhas" : "sem lagartinhas"}</p>;
}

describe("useLagartinhasEnabled", () => {
  it("says yes for a colmeia that turned the switch on", async () => {
    const screen = renderInColmeia(await exampleColmeia(true), <Answer />);

    await waitFor(() => expect(screen.queryByText("tem lagartinhas")).not.toBeNull());
  });

  it("says no for a colmeia that turned it off, children in it or not", async () => {
    const screen = renderInColmeia(await exampleColmeia(false), <Answer />);

    await waitFor(() => expect(screen.queryByText("sem lagartinhas")).not.toBeNull());
    expect(screen.queryByText("tem lagartinhas")).toBeNull();
  });

  it("says no while the colmeia has not answered yet", async () => {
    const screen = renderInColmeia(await exampleColmeia(true), <Answer />);

    expect(screen.queryByText("sem lagartinhas")).not.toBeNull();
  });
});
