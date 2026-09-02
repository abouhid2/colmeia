import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HomePage } from "../../pages/HomePage";
import { exampleColmeia, renderInColmeia } from "../../test/colmeia";

afterEach(cleanup);

describe("PendingReviews on the Início page", () => {
  it("offers the nota while the estação runs and takes it away once it is closed", async () => {
    const colmeia = await exampleColmeia(true);
    const running = colmeia.seasons.find((season) => season.closedAt === null);

    const open = renderInColmeia(colmeia, <HomePage />);
    await waitFor(() => expect(open.getByRole("button", { name: "Confirmar nota" })).not.toBeNull());
    cleanup();

    await colmeia.api.seasons.close(running?.id ?? 0);
    const frozen = renderInColmeia({ ...colmeia, seasons: await colmeia.api.seasons.list() }, <HomePage />);

    // The tarefa waiting for a nota is still on the page, without a way to score it.
    const reviews = await waitFor(() => frozen.getByText("Para avaliar").closest("section"));
    expect(reviews?.textContent).toContain("Limpar o banheiro");
    expect(reviews?.querySelector("button")).toBeNull();
    expect(frozen.getByText("A estação encerrou, então essas ficaram sem nota.")).not.toBeNull();
    expect(frozen.queryByRole("button", { name: "Confirmar nota" })).toBeNull();
  });
});
