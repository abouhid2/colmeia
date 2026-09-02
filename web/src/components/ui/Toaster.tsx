import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Toast, ToastTone } from "../../hooks/useToast";
import { cn } from "../../lib/cn";

const TONE_CLASSES: Record<ToastTone, string> = {
  info: "bg-ink text-paper",
  success: "bg-leaf-700 text-white",
  error: "bg-berry-700 text-white",
};

const TONE_ICONS: Record<ToastTone, typeof Info> = { info: Info, success: CheckCircle2, error: AlertCircle };

interface ToasterProps {
  toasts: Toast[];
  onDismiss(id: number): void;
}

/**
 * A manual popover, so toasts join the browser's top layer and stay visible over
 * an open <dialog>. Re-shown on every change to stay above dialogs opened later.
 */
export function Toaster({ toasts, onDismiss }: ToasterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof element.showPopover !== "function") return;
    try {
      if (element.matches(":popover-open")) element.hidePopover();
      if (toasts.length > 0) element.showPopover();
    } catch {
      // Older browsers: the element simply stays a fixed layer.
    }
  }, [toasts]);

  return (
    <div
      ref={ref}
      popover="manual"
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 top-auto z-50 m-0 flex h-auto w-auto max-w-none flex-col items-center gap-2 overflow-visible border-0 bg-transparent p-0 px-4 md:bottom-6"
    >
      {toasts.map((toast) => {
        const Icon = TONE_ICONS[toast.tone];
        return (
          <div key={toast.id} className={cn("pointer-events-auto flex max-w-md items-center gap-2 rounded-full py-2 pl-4 pr-2 text-sm font-medium shadow-pop animate-rise", TONE_CLASSES[toast.tone])}>
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{toast.message}</span>
            <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Fechar aviso" className="ml-1 grid size-7 place-items-center rounded-full hover:bg-white/15">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
