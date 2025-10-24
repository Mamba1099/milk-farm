"use client";

import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ServingRecordsList } from "@/components/production/serving-records-list";

// Animation variants
const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ServingRecordsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleAdd = () => {
    router.push("/production/serving/add");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div
        className="mx-2"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8"
          variants={fadeInUp}
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Serving Records
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track breeding and serving activities for your animals
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              Add Serving Record
            </Button>
          )}
        </motion.div>

        {/* Serving Records List */}
        <motion.div
          className=""
          variants={fadeInUp}
        >
          <ServingRecordsList showAddButton={false} />
        </motion.div>
      </motion.div>
    </div>
  );
}
