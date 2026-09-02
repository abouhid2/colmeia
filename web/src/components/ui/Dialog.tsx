import { X } from "lucide-react";
import { useId, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { IconButton } from "./IconButton";
import { bringToastsToFront } from "./Toaster";

interface DialogProps {
  open: boolean;
  onClose(): void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Native <dialog>: focus trapping, Escape and the backdrop come for free. Children unmount on close so forms start clean. */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Layout, not effect: children unmount with `open`, and an effect would let
  // the browser paint one frame of an open dialog with nothing but its header.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      bringToastsToFront();
    }
    if (!open && element.open) element.close();
  }, [open]);

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={closeOnBackdrop}
      aria-labelledby={titleId}
      className="m-auto w-[min(100vw,30rem)] rounded-card bg-surface p-0 text-ink shadow-pop open:animate-rise max-sm:mb-0 max-sm:mt-auto max-sm:rounded-b-none motion-reduce:animate-none"
    >
      <div className="max-h-[min(88dvh,44rem)] overflow-y-auto p-6" onClick={(event) => event.stopPropagation()}>
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          <IconButton label="Fechar" icon={<X className="size-5" />} onClick={onClose} className="-mr-2 -mt-1" />
        </header>
        {open && children}
      </div>
    </dialog>
  );
}
