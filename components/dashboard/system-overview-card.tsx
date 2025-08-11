"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { ClockLoader } from "react-spinners";
import { useAuth } from "@/lib/auth-context";
import { useDashboardStats } from "@/hooks";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } 
  },
};

export function SystemOverviewCard() {
  const { canEdit } = useAuth();
  const { systemHealth } = useDashboardStats();
  const systemData = systemHealth.data;

  if (!canEdit) {
    return null;
  }

  return (
    <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-red-200 to-red-400 border-red-300 hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader>
         <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
            <Icons.settings className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemHealth.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <ClockLoader 
                color="#dc2626" 
                size={50} 
                speedMultiplier={0.8}
              />
            </div>
          ) : systemHealth.isError ? (
            <div className="text-center py-8">
              <p className="text-red-700 text-sm">
                Failed to load system health
              </p>
            </div>
          ) : !systemData ? (
            <div className="text-center py-8">
              <p className="text-red-700 text-sm">
                No system data found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {systemData.environment === "production"
                      ? "Production"
                      : "Development"}
                  </div>
                  <div className="text-sm text-blue-800">
                    Environment
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">
                    Database:
                  </span>
                  <span
                    className={`text-md font-bold text-gray-900`}
                  >
                    {systemData.database.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">
                    File Storage:
                  </span>
                  <span
                    className={`text-md font-bold text-gray-900`}
                  >
                    {systemData.fileStorage.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">
                    Auth System:
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      systemData.authSystem.status === "Secure"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {systemData.authSystem.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">
                    API Status:
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      systemData.api.status === "Operational"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {systemData.api.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/40 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-red-700">
                    Last Backup:{" "}
                    <span className="font-semibold">
                      {systemData.lastBackup || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
