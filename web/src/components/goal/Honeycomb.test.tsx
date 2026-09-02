import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Member } from "../../domain/types";
import { Honeycomb } from "./Honeycomb";

afterEach(cleanup);

function person(id: number, color: Member["color"], pattern: Member["pattern"]) {
  return { id, color, pattern };
}

/** The fills the cells were painted with, in the order they were drawn. */
function paintedWith(container: HTMLElement): string[] {
  return [ ...container.querySelectorAll("path[fill]") ].map((node) => node.getAttribute("fill") ?? "");
}

describe("Honeycomb", () => {
  it("gives every person the cells they filled, in their own texture", () => {
    const { container } = render(
      <Honeycomb
        earned={40}
        target={50}
        label="Favo da meta"
        contributions={[ { memberId: 1, points: 25 }, { memberId: 2, points: 15 } ]}
        members={[ person(1, "pollen", "dots"), person(2, "sky", "stripes") ]}
      />,
    );

    const [ ana, bruno ] = [ ...container.querySelectorAll("pattern") ].map((node) => node.id);
    const painted = paintedWith(container);

    expect(painted.filter((fill) => fill === `url(#${ana})`)).toHaveLength(13);
    expect(painted.filter((fill) => fill === `url(#${bruno})`)).toHaveLength(8);
  });

  it("splits the cell where two people meet between the two of them", () => {
    const { container } = render(
      <Honeycomb
        earned={40}
        target={50}
        label="Favo da meta"
        contributions={[ { memberId: 1, points: 25 }, { memberId: 2, points: 15 } ]}
        members={[ person(1, "pollen", "dots"), person(2, "sky", "stripes") ]}
      />,
    );

    const heights = [ ...container.querySelectorAll("clipPath rect") ].map((node) => Number(node.getAttribute("height")));

    // The thirteenth cell holds half of Ana's points and half of Bruno's.
    expect(heights[12]).toBe(10);
    expect(heights[13]).toBe(10);
  });

  it("falls back to honey for somebody who is not in the colmeia any more", () => {
    const { container } = render(
      <Honeycomb earned={10} target={50} label="Favo da meta" contributions={[ { memberId: 9, points: 10 } ]} members={[]} />,
    );

    expect(container.querySelectorAll("pattern")).toHaveLength(0);
    expect(container.querySelectorAll("path.fill-honey-500")).toHaveLength(5);
  });

  it("fills as far as the points say even when nobody is credited with some", () => {
    const { container } = render(
      <Honeycomb
        earned={20}
        target={50}
        label="Favo da meta"
        contributions={[ { memberId: 1, points: 10 } ]}
        members={[ person(1, "leaf", "rings") ]}
      />,
    );

    expect(paintedWith(container)).toHaveLength(5);
    expect(container.querySelectorAll("path.fill-honey-500")).toHaveLength(5);
  });
});
