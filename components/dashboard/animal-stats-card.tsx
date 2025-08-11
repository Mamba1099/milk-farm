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

export function AnimalStatsCard() {
  const { animals } = useDashboardStats();

  if (animals.isLoading) {
    return (
      <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
              Animal Statistics
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

  if (animals.isError) {
    return (
      <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
              Animal Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">Failed to load animal data</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!animals.data || animals.data.total === 0) {
    return (
      <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
              Animal Statistics
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

  return (
    <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-purple-200 to-purple-400 hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
            <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
            Animal Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-blue-800">Total Animals</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{stats.healthy}</div>
                  <div className="text-sm text-blue-800">Healthy</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-white/40 rounded">
                  <div className="text-2xl font-bold text-gray-900">{stats.cows}</div>
                  <div className="text-sm text-blue-800">Cows</div>
                </div>
                <div className="text-center p-2 bg-white/40 rounded">
                  <div className="text-2xl font-bold text-gray-900">{stats.bulls}</div>
                  <div className="text-sm text-blue-800">Bulls</div>
                </div>
                <div className="text-center p-2 bg-white/40 rounded">
                  <div className="text-2xl font-bold text-gray-900">{stats.calves}</div>
                  <div className="text-sm text-blue-800">Calves</div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Matured:</span>
                  <span className="text-md font-bold text-gray-900">{stats.matured}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Sick:</span>
                  <span className="text-md font-bold text-gray-900">{stats.sick}</span>
                </div>
                {stats.injured > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">Injured:</span>
                    <span className="text-md font-bold text-gray-900">{stats.injured}</span>
                  </div>
                )}
              </div>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
