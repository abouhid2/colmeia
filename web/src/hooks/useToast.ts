import { createContext, useContext } from "react";

export type ToastTone = "info" | "success" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface ToastInput {
  message: string;
  tone?: ToastTone;
}

export interface ToastContextValue {
  toasts: Toast[];
  notify(input: ToastInput): void;
  dismiss(id: number): void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside AppProviders");
  return context;
}
