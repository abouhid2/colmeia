import { act, cleanup, fireEvent, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MEMBER_PATTERN_OPTIONS } from "../../domain/memberPatterns";
import type { MemberPattern } from "../../domain/types";
import { PatternPicker } from "./PatternPicker";
import { useMemberForm } from "./useMemberForm";

afterEach(cleanup);

describe("PatternPicker", () => {
  it("offers every texture and says which one was picked", () => {
    const picked: MemberPattern[] = [];
    const screen = render(<PatternPicker color="sky" pattern="solid" onPattern={(next) => picked.push(next)} />);

    expect(screen.getAllByRole("radio")).toHaveLength(MEMBER_PATTERN_OPTIONS.length);
    expect(screen.getByRole("radio", { name: "Lisa" }).getAttribute("aria-checked")).toBe("true");

    fireEvent.click(screen.getByRole("radio", { name: "Ondas" }));
    expect(picked).toEqual([ "waves" ]);
  });

  it("draws each texture in the colour the person is wearing", () => {
    const screen = render(<PatternPicker color="leaf" pattern="dots" onPattern={() => {}} />);

    const grounds = [ ...screen.container.querySelectorAll("pattern rect") ];
    expect(grounds.some((node) => node.classList.contains("fill-leaf-100"))).toBe(true);
    expect(grounds.every((node) => !node.classList.contains("fill-lake-100"))).toBe(true);
  });
});

describe("useMemberForm", () => {
  it("carries the texture into what gets saved", () => {
    const { result } = renderHook(() => useMemberForm(null));

    expect(result.current.values.pattern).toBe("solid");
    act(() => result.current.setPattern("crosses"));
    expect(result.current.toInput().pattern).toBe("crosses");
  });
});
