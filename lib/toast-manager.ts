/**
 * Toast manager for API client to show notifications
 * This allows the API interceptor to show toasts without circular dependencies
 */

type ToastFunction = (options: {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}) => void;

let globalToast: ToastFunction | null = null;

export const setGlobalToast = (toast: ToastFunction) => {
  globalToast = toast;
};

export const showToast = (options: {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}) => {
  if (globalToast) {
    globalToast(options);
  }
};