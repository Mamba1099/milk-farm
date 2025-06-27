"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useState } from "react";

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

export default function ReportsPage() {
  const { canEdit } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9] p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="mb-6 sm:mb-8" variants={fadeInUp}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Farm Reports
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                View and generate comprehensive farm reports
              </p>
            </div>
            {canEdit && (
              <Button className="flex items-center gap-2 bg-[#2d5523] hover:bg-[#1e3a1a] text-white w-full sm:w-auto text-sm sm:text-base">
                <Icons.fileText className="h-4 w-4" />
                Generate Custom Report
              </Button>
            )}
          </div>
        </motion.div>

        {/* Report Filters */}
        <motion.div variants={fadeInUp}>
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-800 text-base sm:text-lg">
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <Input type="date" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <Input type="date" className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-xs sm:text-sm font-medium">
                      Total Revenue
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-800">
                      $12,450
                    </p>
                    <p className="text-xs text-blue-600">
                      +12% from last month
                    </p>
                  </div>
                  <Icons.barChart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-xs sm:text-sm font-medium">
                      Milk Production
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-800">
                      1,850L
                    </p>
                    <p className="text-xs text-green-600">
                      +8% from last month
                    </p>
                  </div>
                  <Icons.milk className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-xs sm:text-sm font-medium">
                      Active Animals
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-800">
                      47
                    </p>
                    <p className="text-xs text-orange-600">+2 new this month</p>
                  </div>
                  <Icons.cow className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-xs sm:text-sm font-medium">
                      Efficiency
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-800">
                      94%
                    </p>
                    <p className="text-xs text-purple-600">
                      +3% from last month
                    </p>
                  </div>
                  <Icons.barChart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Available Reports */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Production Report */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 text-sm sm:text-base">
                  <Icons.milk className="h-4 w-4 sm:h-5 sm:w-5" />
                  Production Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Detailed milk production analytics with trends and forecasts.
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm">
                    View Report
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                    >
                      Export PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Animal Health Report */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 text-sm sm:text-base">
                  <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
                  Animal Health Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Comprehensive health status and medical history of all
                  animals.
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm">
                    View Report
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                    >
                      Export PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Report */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 text-sm sm:text-base">
                  <Icons.barChart className="h-4 w-4 sm:h-5 sm:w-5" />
                  Financial Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Revenue, expenses, and profitability analysis.
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm">
                    View Report
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 text-xs sm:text-sm"
                    >
                      Export PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Employee Performance */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800 text-sm sm:text-base">
                  <Icons.users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Employee Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Employee productivity and task completion analytics.
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm">
                    View Report
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 text-xs sm:text-sm"
                    >
                      Export PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Inventory Report */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800 text-sm sm:text-base">
                  <Icons.fileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Inventory Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Feed, equipment, and supply inventory tracking.
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm">
                    View Report
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                    >
                      Export PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Custom Reports */}
          {canEdit && (
            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800 text-sm sm:text-base">
                    <Icons.settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    Custom Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Create custom reports with specific parameters and filters.
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm">
                      Create Report
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm"
                    >
                      View Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Role-based Information */}
        {!canEdit && (
          <motion.div
            className="mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icons.shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800 text-sm sm:text-base">
                View-Only Access
              </h3>
            </div>
            <p className="text-blue-700 text-xs sm:text-sm">
              You can view reports but cannot generate or export custom reports.
              Contact your farm manager for advanced reporting features.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
