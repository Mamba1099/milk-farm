"use client";

import { motion, type Variants } from "framer-motion";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } 
  },
};

export function RoleBasedInfo() {
  const { canEdit } = useAuth();

  if (canEdit) {
    return null;
  }

  return (
    <motion.div variants={fadeInUp} className="mt-6 sm:mt-8">
      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="flex items-center gap-2 mb-2">
          <Icons.shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Employee Access</h3>
        </div>
        <p className="text-blue-700 text-sm sm:text-base">
          You have read-only access to most features. For administrative
          tasks like adding animals, editing records, or system settings,
          please contact your farm manager.
        </p>
      </div>
    </motion.div>
  );
}
