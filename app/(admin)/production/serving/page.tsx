"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

// Animation variants
const fadeInUp = {
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

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ServingRecordsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
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
              Serving Records
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track breeding and serving activities for your animals
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base">
              <Plus size={18} className="sm:w-5 sm:h-5" />
              Add Serving Record
            </Button>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search by animal tag or serving record..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Outcomes</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <Filter size={16} className="sm:w-5 sm:h-5" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Serving Records List */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          {/* Placeholder for serving records */}
          <Card className="p-6 sm:p-8">
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500 mb-4 text-sm sm:text-base">
                No serving records found
              </div>
              <p className="text-gray-400 mb-6 text-sm sm:text-base">
                Start tracking breeding activities by adding serving records
              </p>
              {user?.role === "FARM_MANAGER" && (
                <Button className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base">
                  Add First Serving Record
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
