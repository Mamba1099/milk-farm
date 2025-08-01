"use client";

import { motion, type Variants } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } 
  },
};

export function DashboardHeader() {
  const { user, isFarmManager } = useAuth();

  return (
    <motion.div variants={fadeInUp} className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        {isFarmManager ? "Manager Dashboard" : "Employee Dashboard"}
      </h1>
      <p className="text-gray-600 mt-2 text-sm sm:text-base">
        Welcome back, {user?.username}!
        {isFarmManager ? " (Farm Manager)" : " (Employee)"}
      </p>
    </motion.div>
  );
}
