import { useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

const toasts: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

export function useToast() {
  const toast = useCallback(
    (props: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { ...props, id };
      toasts.push(newToast);
      listeners.forEach((listener) => listener([...toasts]));

      setTimeout(() => {
        toasts.splice(toasts.indexOf(newToast), 1);
        listeners.forEach((listener) => listener([...toasts]));
      }, 3000);

      return { id, dismiss: () => {} };
    },
    []
  );

  return { toast };
}
