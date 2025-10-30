"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { ClockLoader } from "react-spinners";
import { useDashboardStats } from "@/hooks";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } 
  },
};

const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export function QuickAnalyticsOverview() {
  const { production, animals } = useDashboardStats();
  const productionData = production.data;
  const animalsData = animals.data;
  // Refetch stats if the day changes
  const [lastDate, setLastDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      if (today !== lastDate && production.refetch) {
        setLastDate(today);
        production.refetch();
        animals.refetch && animals.refetch();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastDate, production, animals]);

  return (
    <motion.div
      variants={staggerContainer}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
    >
      {/* Production Trend Mini Chart */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 text-base sm:text-lg">
              <Icons.analytics className="h-4 w-4 sm:h-5 sm:w-5" />
              Production Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {production.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <ClockLoader 
                  color="#2563eb" 
                  size={50} 
                  speedMultiplier={0.8}
                />
              </div>
            ) : production.isError ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-sm">
                  Failed to load production data
                </p>
              </div>
            ) : productionData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600">
                      Total Production
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {(productionData?.totalQuantity || 0).toLocaleString()}L
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600">Daily Average</p>
                    <p className="text-lg font-bold text-green-800">
                      {(productionData.averageDaily || 0).toFixed(1)}L
                    </p>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600">
                    Per Animal Average
                  </p>
                  <p className="text-lg font-bold text-purple-800">
                    {(productionData.averagePerAnimal || 0).toFixed(1)}L/day
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      Production Efficiency
                    </span>
                    <span className="text-xs text-gray-500">
                      {(
                        (productionData.averagePerAnimal / 25) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          100,
                          (productionData.averagePerAnimal / 25) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No production data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Status Mini Chart */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 text-base sm:text-lg">
              <Icons.heartPulse className="h-4 w-4 sm:h-5 sm:w-5" />
              Animal Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {animals.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <ClockLoader 
                  color="#16a34a" 
                  size={50} 
                  speedMultiplier={0.8}
                />
              </div>
            ) : animals.isError ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-sm">
                  Failed to load animal data
                </p>
              </div>
            ) : animalsData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600">Healthy</p>
                    <p className="text-lg font-bold text-green-800">
                      {animalsData.healthy}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-600">
                      Need Attention
                    </p>
                    <p className="text-lg font-bold text-yellow-800">
                      {animalsData.sick + animalsData.injured}
                    </p>
                  </div>
                </div>

                {/* Health Distribution Visual */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-green-700">
                        Healthy Animals
                      </span>
                      <span>
                        {(
                          (animalsData.healthy / animalsData.total) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${
                            (animalsData.healthy / animalsData.total) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {animalsData.sick > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-yellow-700">
                          Sick Animals
                        </span>
                        <span>
                          {(
                            (animalsData.sick / animalsData.total) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              (animalsData.sick / animalsData.total) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {animalsData.injured > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-red-700">
                          Injured/Recovering
                        </span>
                        <span>
                          {(
                            (animalsData.injured / animalsData.total) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              (animalsData.injured / animalsData.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No animal data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
