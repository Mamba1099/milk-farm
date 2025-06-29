"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import {
  AnimalStatsCard,
  ProductionStatsCard,
  TreatmentStatsCard,
} from "@/components/dashboard/dashboard-stats";
import { useDashboardStats } from "@/hooks/use-dashboard-hooks";

// Animation variants
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
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

export default function DashboardPage() {
  const { user, canEdit, isFarmManager } = useAuth();
  const { animals, production, users } = useDashboardStats();

  // Get data with fallbacks
  const animalsData = animals.data;
  const productionData = production.data;
  const userData = users.data;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9]">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="p-4 sm:p-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isFarmManager ? "Manager Dashboard" : "Employee Dashboard"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Welcome back, {user?.username}!
            {isFarmManager ? " (Farm Manager)" : " (Employee)"}
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {/* Profile Card */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
                  <Icons.user className="h-4 w-4 sm:h-5 sm:w-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Username:</span>
                    <span className="text-sm font-medium">
                      {user?.username || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="text-sm font-medium">
                      {isFarmManager ? "Farm Manager" : "Employee"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Access Level:</span>
                    <span className="text-sm font-medium">
                      {canEdit ? "Full Access" : "Read Only"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Joined:</span>
                    <span className="text-sm font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Animal Statistics */}
          <AnimalStatsCard />

          {/* Production Statistics */}
          <ProductionStatsCard />

          {/* Treatment/Health Statistics */}
          <TreatmentStatsCard />

          {/* Employee Management - Admin Only */}
          {canEdit && (
            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Icons.users className="h-5 w-5" />
                    Employee Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {users.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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
                          <div className="text-2xl font-bold text-orange-800">
                            {userData.totalUsers}
                          </div>
                          <div className="text-xs text-orange-600">
                            Total Users
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-orange-800">
                            {userData.activeUsers}
                          </div>
                          <div className="text-xs text-orange-600">
                            Active Users
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-orange-600">
                            Farm Managers:
                          </span>
                          <span className="text-sm font-medium text-orange-800">
                            {userData.farmManagers}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-orange-600">
                            Employees:
                          </span>
                          <span className="text-sm font-medium text-orange-800">
                            {userData.employees}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-orange-600">
                            Your Role:
                          </span>
                          <span className="text-sm font-medium text-orange-800">
                            {isFarmManager ? "Farm Manager" : "Employee"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-white/40 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm text-orange-700">
                            System Access:{" "}
                            <span className="font-semibold">Full Control</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* System Settings - Admin Only */}
          {canEdit && (
            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Icons.settings className="h-5 w-5" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-lg font-bold text-red-800">
                          {process.env.NODE_ENV === "production"
                            ? "Production"
                            : "Development"}
                        </div>
                        <div className="text-xs text-red-600">Environment</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">Database:</span>
                        <span className="text-sm font-medium text-green-600">
                          Connected
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">
                          File Storage:
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">
                          Auth System:
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Secure
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">
                          API Status:
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Operational
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white/40 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-red-700">
                          Last Backup:{" "}
                          <span className="font-semibold">N/A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Farm Statistics Summary */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-800">
                  <Icons.barChart className="h-5 w-5" />
                  Farm Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-800">
                        {animalsData?.total || 0}
                      </div>
                      <div className="text-xs text-indigo-600">
                        Total Animals
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-800">
                        {productionData?.todayQuantity || 0}L
                      </div>
                      <div className="text-xs text-indigo-600">
                        Today&apos;s Milk
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-600">
                        Health Status:
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {animalsData?.healthy || 0} Healthy
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-600">
                        Production Records:
                      </span>
                      <span className="text-sm font-medium text-indigo-800">
                        {productionData?.totalRecords || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-600">
                        System Users:
                      </span>
                      <span className="text-sm font-medium text-indigo-800">
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
        </motion.div>

        {/* Role-based Information */}
        {!canEdit && (
          <motion.div variants={fadeInUp} className="mt-6 sm:mt-8">
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Icons.shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Employee Access</h3>
              </div>
              <p className="text-blue-700 text-sm sm:text-base">
                You have read-only access to most features. For administrative
                tasks like adding animals, editing records, or system settings,
                please contact your farm manager.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
