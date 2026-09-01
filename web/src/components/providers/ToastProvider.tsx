import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type Toast, type ToastInput } from "../../hooks/useToast";
import { Toaster } from "../ui/Toaster";

const TOAST_LIFETIME_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(({ message, tone = "info" }: ToastInput) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
  }, [dismiss]);

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
