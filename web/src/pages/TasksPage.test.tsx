import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { exampleColmeia, renderInColmeia } from "../test/colmeia";
import { TasksPage } from "./TasksPage";

afterEach(cleanup);

/** The filter chip and the badge on every task card read the same. */
const KID_WORDING = /Para lagartinhas/;

describe("TasksPage", () => {
  it("offers the lagartinhas filter, and marks the tasks, while the colmeia has children", async () => {
    const screen = renderInColmeia(await exampleColmeia(true), <TasksPage />);

    await waitFor(() => expect(screen.getByRole("button", { name: KID_WORDING })).not.toBeNull());
    // The chip plus one badge on each of the three tasks marked for a child.
    expect(screen.queryAllByText(KID_WORDING)).toHaveLength(4);
  });

  it("says nothing about lagartinhas once the switch is off", async () => {
    const screen = renderInColmeia(await exampleColmeia(false), <TasksPage />);

    await waitFor(() => expect(screen.queryByText("Lavar a louça do jantar")).not.toBeNull());
    expect(screen.queryAllByText(KID_WORDING)).toHaveLength(0);
    expect(screen.queryByRole("button", { name: KID_WORDING })).toBeNull();
  });
});
