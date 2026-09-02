import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Toast } from "../../hooks/useToast";
import { Dialog } from "./Dialog";
import { bringToastsToFront, Toaster } from "./Toaster";

// jsdom ships neither the top layer nor <dialog>, so the calls onto it are what
// there is to watch.
const open = new Set<Element>();
const showPopover = vi.fn(function (this: HTMLElement) { open.add(this); });
const hidePopover = vi.fn(function (this: HTMLElement) { open.delete(this); });
const showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute("open", ""); });
const nativeMatches = Element.prototype.matches;

// Element.matches is overloaded into type predicates, so it goes on by hand.
function patchMatches(value: unknown): void {
  Object.defineProperty(Element.prototype, "matches", { configurable: true, writable: true, value });
}

function toast(id: number): Toast {
  return { id, message: `Aviso ${id}`, tone: "info" };
}

beforeEach(() => {
  open.clear();
  showPopover.mockClear();
  hidePopover.mockClear();
  showModal.mockClear();
  Object.assign(HTMLElement.prototype, { showPopover, hidePopover });
  Object.assign(HTMLDialogElement.prototype, { showModal, close: vi.fn() });
  patchMatches(function (this: Element, selector: string): boolean {
    return selector === ":popover-open" ? open.has(this) : nativeMatches.call(this, selector);
  });
});

afterEach(() => {
  cleanup();
  patchMatches(nativeMatches);
});

describe("Toaster", () => {
  it("shows the stack once instead of reading it out again on every toast", () => {
    const { rerender } = render(<Toaster toasts={[ toast(1) ]} onDismiss={() => {}} />);
    expect(showPopover).toHaveBeenCalledTimes(1);

    rerender(<Toaster toasts={[ toast(1), toast(2) ]} onDismiss={() => {}} />);

    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(hidePopover).not.toHaveBeenCalled();
  });

  it("hides itself when the last toast goes away", () => {
    const { rerender } = render(<Toaster toasts={[ toast(1) ]} onDismiss={() => {}} />);

    rerender(<Toaster toasts={[]} onDismiss={() => {}} />);

    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it("climbs back on top when asked, and only if it is showing", () => {
    const { rerender } = render(<Toaster toasts={[]} onDismiss={() => {}} />);
    bringToastsToFront();
    expect(showPopover).not.toHaveBeenCalled();

    rerender(<Toaster toasts={[ toast(1) ]} onDismiss={() => {}} />);
    bringToastsToFront();

    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(showPopover).toHaveBeenCalledTimes(2);
  });
});

describe("Dialog", () => {
  it("puts the toasts back above itself when it opens", () => {
    const screen = (open: boolean) => (
      <>
        <Toaster toasts={[ toast(1) ]} onDismiss={() => {}} />
        <Dialog open={open} onClose={() => {}} title="Nova tarefa">conteúdo</Dialog>
      </>
    );
    const { rerender } = render(screen(false));
    expect(showPopover).toHaveBeenCalledTimes(1);

    rerender(screen(true));

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(showPopover).toHaveBeenCalledTimes(2);
  });
});
