"use client";

import React, { createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast, Toast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastState = useToast();

  return (
    <ToastContext.Provider value={toastState}>
      {children}
      <ToastContainer toasts={toastState.toasts} removeToast={toastState.removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 w-full md:max-w-sm p-4 space-y-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <Icons.check className="h-5 w-5 text-green-600" />;
      case "error":
        return <Icons.x className="h-5 w-5 text-red-600" />;
      case "warning":
        return <Icons.alertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Icons.info className="h-5 w-5 text-blue-600" />;
      default:
        return <Icons.info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-yellow-500";
      case "info":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border-l-4 bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5",
        getBorderColor()
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="mt-1 text-sm text-gray-700">
            {toast.description}
          </p>
        )}
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Icons.x className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
