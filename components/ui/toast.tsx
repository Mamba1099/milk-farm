"use client";

import { useToast as useToastOriginal } from "@/hooks/use-toast";

export const useToast = useToastOriginal;

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
