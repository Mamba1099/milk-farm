"use client";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay = ({ 
  isVisible, 
  message = "Creating your account..." 
}: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#2d5523] flex items-center justify-center">
            <Icons.spinner className="h-8 w-8 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-[#2d5523] mb-2">
            Please Wait
          </h3>
          <p className="text-[#4a6b3d]">{message}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
