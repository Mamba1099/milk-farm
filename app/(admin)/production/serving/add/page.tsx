"use client";

import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServingForm } from "@/components/production/serving-form";

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

export default function AddServingPage() {
  const router = useRouter();

  const handleSuccess = () => {
  };

  const handleClose = () => {
    router.push("/production/serving");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8"
          variants={fadeInUp}
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Add New Serving Record
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Record breeding and serving activities for your female animals
            </p>
          </div>
        </motion.div>

        {/* Form in Modal Style */}
        <motion.div variants={fadeInUp}>
          <ServingForm
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
