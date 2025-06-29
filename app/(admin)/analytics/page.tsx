"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useState } from "react";
import {
  useAnimalStats,
  useProductionStats,
  useTreatmentStats,
} from "@/hooks/use-dashboard-hooks";
import {
  useProductionReport,
  useAnimalsReport,
  useTreatmentsReport,
} from "@/hooks/use-reports-hooks";

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

export default function AnalyticsPage() {
  const { canEdit } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30"); // days
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch real-time stats
  const { data: animalsStats, isLoading: animalsLoading } = useAnimalStats();
  const { data: productionStats, isLoading: productionLoading } =
    useProductionStats();
  const { data: treatmentsStats, isLoading: treatmentsLoading } =
    useTreatmentStats();

  // Fetch detailed reports for charts
  const { data: productionReport } = useProductionReport(startDate, endDate);
  const { data: animalsReport } = useAnimalsReport(startDate, endDate);
  const { data: treatmentsReport } = useTreatmentsReport(startDate, endDate);

  // Chart data preparations
  const productionChartData =
    productionReport?.report?.byAnimal?.slice(0, 10) || [];
  const animalTypesData = animalsReport?.report?.summary?.byType || {};
  const healthStatusData = {
    healthy: animalsReport?.report?.summary?.healthyAnimals || 0,
    sick: animalsReport?.report?.summary?.sickAnimals || 0,
    injured: animalsReport?.report?.summary?.injuredAnimals || 0,
  };

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
                Farm Analytics
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Visual insights and trends for your dairy farm operations
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Controls */}
        <motion.div variants={fadeInUp}>
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-800 text-base sm:text-lg">
                Analytics Filters
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
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics Overview */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={staggerContainer}
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-xs sm:text-sm font-medium">
                      Total Production
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-800">
                      {productionLoading
                        ? "Loading..."
                        : `${(
                            productionStats?.totalQuantity || 0
                          ).toLocaleString()}L`}
                    </p>
                    <p className="text-xs text-blue-600">
                      Avg: {productionStats?.averageDaily?.toFixed(1) || 0}L/day
                    </p>
                  </div>
                  <Icons.milk className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
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
                      Active Animals
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-800">
                      {animalsLoading ? "Loading..." : animalsStats?.total || 0}
                    </p>
                    <p className="text-xs text-green-600">
                      {animalsStats?.healthy || 0} healthy
                    </p>
                  </div>
                  <Icons.cow className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
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
                      Treatments
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-800">
                      {treatmentsLoading
                        ? "Loading..."
                        : treatmentsStats?.total || 0}
                    </p>
                    <p className="text-xs text-orange-600">
                      ${(treatmentsStats?.totalCost || 0).toFixed(2)} total cost
                    </p>
                  </div>
                  <Icons.shield className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
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
                      Avg Production
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-800">
                      {productionLoading
                        ? "Loading..."
                        : `${(productionStats?.averagePerAnimal || 0).toFixed(
                            1
                          )}L`}
                    </p>
                    <p className="text-xs text-purple-600">per animal/day</p>
                  </div>
                  <Icons.barChart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={staggerContainer}
        >
          {/* Production by Animal Chart */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Icons.barChart className="h-5 w-5" />
                  Top Producing Animals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productionChartData.length > 0 ? (
                    productionChartData.map((item, index) => {
                      const maxProduction = Math.max(
                        ...productionChartData.map((d) => d.totalQuantity)
                      );
                      const percentage =
                        (item.totalQuantity / maxProduction) * 100;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">
                              {item.animal.tagNumber} -{" "}
                              {item.animal.name || "Unnamed"}
                            </span>
                            <span className="text-gray-600">
                              {item.totalQuantity}L ({item.recordCount} records)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No production data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Animal Health Status Chart */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Icons.heartPulse className="h-5 w-5" />
                  Animal Health Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Healthy Animals */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">
                        Healthy
                      </span>
                      <span className="text-sm text-gray-600">
                        {healthStatusData.healthy}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(
                            (healthStatusData.healthy /
                              (animalsStats?.total || 1)) *
                            100
                          ).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Sick Animals */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-yellow-700">
                        Sick
                      </span>
                      <span className="text-sm text-gray-600">
                        {healthStatusData.sick}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(
                            (healthStatusData.sick /
                              (animalsStats?.total || 1)) *
                            100
                          ).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Injured/Recovering Animals */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-700">
                        Injured/Recovering
                      </span>
                      <span className="text-sm text-gray-600">
                        {healthStatusData.injured}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(
                            (healthStatusData.injured /
                              (animalsStats?.total || 1)) *
                            100
                          ).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Animal Types Distribution */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Icons.cow className="h-5 w-5" />
                  Animal Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(animalTypesData).map(([type, count]) => {
                    const percentage = (
                      (count / (animalsStats?.total || 1)) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {type.toLowerCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Treatment Costs Overview */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Icons.shield className="h-5 w-5" />
                  Treatment Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium">
                        Total Treatments
                      </p>
                      <p className="text-2xl font-bold text-orange-800">
                        {treatmentsStats?.total || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">
                        Total Cost
                      </p>
                      <p className="text-2xl font-bold text-red-800">
                        ${(treatmentsStats?.totalCost || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">
                      Average Cost per Treatment
                    </p>
                    <p className="text-2xl font-bold text-purple-800">
                      $
                      {(
                        (treatmentsStats?.totalCost || 0) /
                        Math.max(1, treatmentsStats?.total || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                  {treatmentsReport?.report?.byAnimal &&
                    treatmentsReport.report.byAnimal.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Top Animals by Treatment Cost
                        </h4>
                        <div className="space-y-2">
                          {treatmentsReport.report.byAnimal
                            .slice(0, 5)
                            .map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-xs"
                              >
                                <span>
                                  {item.animal.tagNumber} -{" "}
                                  {item.animal.name || "Unnamed"}
                                </span>
                                <span className="font-semibold">
                                  ${item.totalCost.toFixed(2)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
              You can view analytics but cannot modify system settings. Contact
              your farm manager for advanced configuration options.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
