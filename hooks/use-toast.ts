import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: Omit<Toast, "id">) => {
      return addToast(options);
    },
    [addToast]
  );

  toast.success = (title: string, description?: string) =>
    addToast({ type: "success", title, description });

  toast.error = (title: string, description?: string) =>
    addToast({ type: "error", title, description });

  toast.warning = (title: string, description?: string) =>
    addToast({ type: "warning", title, description });

  toast.info = (title: string, description?: string) =>
    addToast({ type: "info", title, description });

  return {
    toasts,
    toast,
    removeToast,
  };
};
