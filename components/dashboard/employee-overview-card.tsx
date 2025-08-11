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

export function EmployeeOverviewCard() {
  const { canEdit } = useAuth();
  const { users } = useDashboardStats();
  const userData = users.data;

  if (!canEdit) {
    return null;
  }

  return (
    <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-yellow-200 to-yellow-100 border-yellow-300 hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
            <Icons.users className="h-5 w-5" />
            Employee Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <ClockLoader 
                color="#ea580c" 
                size={50} 
                speedMultiplier={0.8}
              />
            </div>
          ) : users.isError ? (
            <div className="text-center py-8">
              <p className="text-orange-700 text-sm">
                Failed to load user data
              </p>
            </div>
          ) : !userData ? (
            <div className="text-center py-8">
              <p className="text-orange-700 text-sm">
                No user data found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold">
                    {userData.employees}
                  </div>
                  <div className="text-base text-gray-900">
                    Total Employees
                  </div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold">
                    {userData.activeUsers}
                  </div>
                  <div className="text-base text-gray-900">
                    Active
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">
                    Farm Managers:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {userData.farmManagers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">
                    Employees:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {userData.employees}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/40 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-900">
                    System Access:{" "}
                    <span className="font-bold">Full Control</span>
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
