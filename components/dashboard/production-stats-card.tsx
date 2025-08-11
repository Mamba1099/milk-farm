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

export const ProductionStatsCard: React.FC = () => {
  const { production } = useDashboardStats();

  if (production.isLoading) {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <Icons.milk className="h-4 w-4 sm:h-5 sm:w-5" />
              Production Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <ClockLoader color="#2d5523" size={60} speedMultiplier={0.8} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (production.isError) {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <Icons.milk className="h-4 w-4 sm:h-5 sm:w-5" />
              Production Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">Failed to load production data</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!production.data || production.data.totalRecords === 0) {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <Icons.milk className="h-4 w-4 sm:h-5 sm:w-5" />
              Production Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <Icons.database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No production records found. Start recording milk production!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const stats = production.data;

  return (
    <motion.div variants={fadeInUp}>
      <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
            <Icons.milk className="h-4 w-4 sm:h-5 sm:w-5" />
            Production Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.todayQuantity}L</div>
                <div className="text-sm text-blue-800">Today's Production</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.weeklyAverage}L</div>
                <div className="text-sm text-blue-800">Daily Average</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Total Records:</span>
                <span className="text-md font-bold text-gray-900">{stats.totalRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Weekly Total:</span>
                <span className="text-md font-bold text-gray-900">{stats.weeklyTotal}L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Last Record:</span>
                <span className="text-sm font-medium text-purple-800">{stats.lastRecordDate ? new Date(stats.lastRecordDate).toLocaleDateString() : "No records"}</span>
              </div>
            </div>
            {stats.weeklyAverage > 0 && (
              <div className="mt-4 p-3 bg-white/40 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-700">
                    {Math.round((stats.todayQuantity / stats.weeklyAverage) * 100 || 0)}%
                  </div>
                  <div className="text-xs text-purple-600">vs Daily Average</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
