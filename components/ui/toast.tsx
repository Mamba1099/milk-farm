"use client";

import { useToastContext } from "./toast-provider";

export const useToast = () => {
  const context = useToastContext();
  return {
    toast: context.toast,
  };
};

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ToasterToast extends Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
}
