import { X } from "lucide-react";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { IconButton } from "./IconButton";

interface DialogProps {
  open: boolean;
  onClose(): void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Native <dialog>: focus trapping, Escape and the backdrop come for free. */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
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
      aria-labelledby="dialog-title"
      className="m-auto w-[min(100vw,30rem)] rounded-card bg-surface p-0 text-ink shadow-pop open:animate-rise max-sm:mb-0 max-sm:mt-auto max-sm:rounded-b-none motion-reduce:animate-none"
    >
      <div className="max-h-[min(88dvh,44rem)] overflow-y-auto p-6" onClick={(event) => event.stopPropagation()}>
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-xl font-bold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          <IconButton label="Fechar" icon={<X className="size-5" />} onClick={onClose} className="-mr-2 -mt-1" />
        </header>
        {children}
      </div>
    </dialog>
  );
}
