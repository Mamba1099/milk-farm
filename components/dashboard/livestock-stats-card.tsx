"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useDashboardStats } from "@/hooks";
import { ClockLoader } from "react-spinners";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } },
};

export function LivestockStatsCard() {
  const { animals } = useDashboardStats();

  // Enhanced debug logging
  console.log("🐄 LivestockStatsCard debug:", {
    isLoading: animals.isLoading,
    isError: animals.isError,
    data: animals.data,
    error: animals.error,
    enabled: animals.isEnabled,
    status: animals.status,
    fetchStatus: animals.fetchStatus,
  });

  if (animals.isLoading) {
    console.log("🔄 LivestockStatsCard: Loading state");
    return (
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
              <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
              Livestock Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <ClockLoader color="#ea580c" size={60} speedMultiplier={0.8} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (animals.isError) {
    console.log("❌ LivestockStatsCard: Error state", animals.error);
    return (
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
              <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
              Livestock Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">Failed to load livestock data</p>
              <p className="text-xs text-gray-500 mt-1">{animals.error?.message}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!animals.data || animals.data.total === 0) {
    console.log("📊 LivestockStatsCard: No data state", animals.data);
    return (
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
              <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
              Livestock Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <Icons.database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No animals found. Add your first animal to get started!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const stats = animals.data;
  console.log("✅ LivestockStatsCard: Success state", stats);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
            <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
            Livestock Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Animals */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-700">Total Animals</span>
              <span className="text-2xl font-bold text-orange-800">{stats.total}</span>
            </div>
          </div>

          {/* Animal Types Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-orange-200/50">
              <div className="flex flex-col items-center space-y-1">
                <Icons.cow className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Cows</span>
                <span className="text-lg font-bold text-orange-800">{stats.cows}</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-orange-200/50">
              <div className="flex flex-col items-center space-y-1">
                <Icons.cow className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Bulls</span>
                <span className="text-lg font-bold text-orange-800">{stats.bulls}</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-orange-200/50">
              <div className="flex flex-col items-center space-y-1">
                <Icons.heart className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Calves</span>
                <span className="text-lg font-bold text-orange-800">{stats.calves}</span>
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200/50">
            <h4 className="text-sm font-semibold text-orange-700 mb-2">Health Status</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-orange-700">Healthy</span>
                </div>
                <span className="text-sm font-bold text-orange-800">{stats.healthy}</span>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                  <span className="text-xs text-orange-700">Sick</span>
                </div>
                <span className="text-sm font-bold text-orange-800">{stats.sick}</span>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-xs text-orange-700">Injured</span>
                </div>
                <span className="text-sm font-bold text-orange-800">{stats.injured}</span>
              </div>
            </div>
          </div>

          {/* Maturity Status */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-700">Matured Animals</span>
              <span className="text-lg font-bold text-orange-800">{stats.matured}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}