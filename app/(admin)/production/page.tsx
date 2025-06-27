"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Calendar, TrendingUp } from "lucide-react";
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

const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function ProductionPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("");

  // Mock data for demonstration
  const totalProduction = 1250.5;
  const averagePerAnimal = 18.7;
  const activeAnimals = 67;

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
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Production Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track daily milk production and monitor farm performance
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/production/add" className="flex-1 sm:flex-none">
                <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full justify-center text-sm sm:text-base m-2">
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  Add Production
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={cardVariants}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Today&apos;s Production
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {totalProduction}L
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Average per Animal
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {averagePerAnimal}L
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Active Animals
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {activeAnimals}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-purple-600 rounded-full"></div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search by animal tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Quality Grades</option>
              <option value="GRADE_A">Grade A</option>
              <option value="GRADE_B">Grade B</option>
              <option value="GRADE_C">Grade C</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedDateRange("");
              }}
              className="flex items-center gap-2 text-sm sm:text-base m-2"
            >
              <Filter size={16} className="sm:w-5 sm:h-5" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Production Records */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          {/* Placeholder for production records */}
          <Card className="p-6 sm:p-8">
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500 mb-4 text-sm sm:text-base">
                No production records found
              </div>
              <p className="text-gray-400 mb-6 text-sm sm:text-base">
                Start tracking milk production by adding daily records
              </p>
              {user?.role === "FARM_MANAGER" && (
                <Link href="/production/add">
                  <Button className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base m-2">
                    Add First Production Record
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
