"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useProductionStats } from "@/hooks/use-production-hooks";
import { ClockLoader } from "react-spinners";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } },
};

export const ProductionStatsCard: React.FC = () => {
  const { data: stats, isLoading, isError } = useProductionStats();

  if (isLoading) {
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

  if (isError) {
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

  if (!stats) {
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
                <div className="text-2xl font-bold text-gray-900">{stats.todayProduction}L</div>
                <div className="text-sm text-blue-800">Today's Production</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.weekProduction}L</div>
                <div className="text-sm text-blue-800">This Week</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Active Animals:</span>
                <span className="text-md font-bold text-gray-900">{stats.activeAnimals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Monthly Total:</span>
                <span className="text-md font-bold text-gray-900">{stats.monthProduction}L</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
