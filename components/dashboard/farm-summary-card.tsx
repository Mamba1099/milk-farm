
"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useDashboardStats } from "@/hooks";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } 
  },
};

export function FarmSummaryCard() {
  const { animals, production, users } = useDashboardStats();
  const animalsData = animals.data;
  const productionData = production.data;
  const userData = users.data;
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
        users.refetch && users.refetch();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastDate, production, animals, users]);

  return (
    <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-indigo-200 to-indigo-400 border-indigo-300 hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader>
         <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
            <Icons.barChart className="h-5 w-5" />
            Farm Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {animalsData?.total || 0}
                </div>
                <div className="text-sm text-blue-800">
                  Total Animals
                </div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {productionData?.todayQuantity || 0}L
                </div>
                <div className="text-sm text-blue-800">
                  Today&apos;s Milk
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">
                  Health Status:
                </span>
                <span className="text-md font-bold text-gray-900">
                  {animalsData?.healthy || 0} Healthy
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">
                  Production Records:
                </span>
                <span className="text-md font-bold text-gray-900">
                  {productionData?.totalRecords || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">
                  System Users:
                </span>
                <span className="text-md font-bold text-gray-900">
                  {userData?.totalUsers || 0}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/40 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-indigo-700">
                  Farm Status:{" "}
                  <span className="font-semibold text-green-600">
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
