"use client";
import { motion } from "framer-motion";
import { RingLoader } from "react-spinners";

interface FullPageLoaderProps {
  isVisible: boolean;
  message?: string;
}

export const FullPageLoader = ({ 
  isVisible, 
  message = "Loading..." 
}: FullPageLoaderProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="mb-8 flex justify-center">
          <RingLoader 
            color="#2d5523" 
            size={80} 
            speedMultiplier={0.8}
          />
        </div>
        <h3 className="text-2xl font-semibold text-[#2d5523] mb-3">
          Please Wait
        </h3>
        <p className="text-[#4a6b3d] text-lg">{message}</p>
      </motion.div>
    </motion.div>
  );
};
