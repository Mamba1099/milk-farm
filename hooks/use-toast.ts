export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}
"use client";

import { useState, useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add toast with optional custom id, prevent duplicates
  const toast = useCallback((options: Omit<Toast, "id"> & { id?: string }) => {
    const id = options.id || Math.random().toString(36).substr(2, 9);
    // Prevent duplicate toasts with same id
    setToasts((prev) => {
      if (prev.some((t) => t.id === id)) return prev;
      return [...prev, { ...options, id }];
    });
    const duration = options.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const isToastActive = useCallback((id: string) => {
    return toasts.some((t) => t.id === id);
  }, [toasts]);

  return {
    toasts,
    toast,
    removeToast,
    isToastActive,
  };
};
