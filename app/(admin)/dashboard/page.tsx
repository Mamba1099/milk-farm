"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

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

          {/* Debug Info - Remove this later */}
          <div className="mt-4 p-3 bg-white/80 backdrop-blur-sm rounded-lg text-xs sm:text-sm border border-white/20">
            <strong>Debug Info:</strong>
            <br />
            User Role: {user?.role || "undefined"}
            <br />
            isFarmManager: {isFarmManager ? "true" : "false"}
            <br />
            canEdit: {canEdit ? "true" : "false"}
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {" "}
          {/* Profile Card */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
                  <Icons.user className="h-4 w-4 sm:h-5 sm:w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base">
                    <strong>Username:</strong> {user?.username}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Role:</strong>{" "}
                    {isFarmManager ? "Farm Manager" : "Employee"}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Joined:</strong>{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {canEdit && (
                    <Link href="/settings">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                      >
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Animal Management */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Icons.cow className="h-5 w-5" />
                  Animal Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href="/animals">
                    <Button
                      className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white mb-3"
                      variant="outline"
                    >
                      View Animals
                    </Button>
                  </Link>
                  {canEdit ? (
                    <>
                      <Link href="/animals/add">
                        <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white mb-3">
                          Add New Animal
                        </Button>
                      </Link>
                      <Link href="/animals/treatments">
                        <Button
                          className="w-full border-green-300 text-green-700 hover:bg-green-50 mb-3"
                          variant="outline"
                        >
                          Health Records
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      View-only access. Contact farm manager to add/edit
                      animals.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Milk Production */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Icons.milk className="h-5 w-5" />
                  Milk Production
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href="/production">
                    <Button
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 mb-3"
                      variant="outline"
                    >
                      View Production Records
                    </Button>
                  </Link>
                  <Link href="/production/add">
                    <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white mb-3">
                      Record Today&apos;s Production
                    </Button>
                  </Link>
                  {canEdit && (
                    <>
                      <Link href="/production/serving">
                        <Button
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 mb-3"
                          variant="outline"
                        >
                          Serving Records
                        </Button>
                      </Link>
                      <Link href="/reports">
                        <Button
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 mb-3"
                          variant="outline"
                        >
                          Generate Reports
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Management - Admin Only */}
            {canEdit && (
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Icons.users className="h-5 w-5" />
                    Employee Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link href="/employees">
                      <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white mb-3">
                        View All Employees
                      </Button>
                    </Link>
                    <Link href="/employees">
                      <Button
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 mb-3"
                        variant="outline"
                      >
                        Manage Permissions
                      </Button>
                    </Link>
                    <Link href="/reports">
                      <Button
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 mb-3"
                        variant="outline"
                      >
                        Employee Reports
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Settings - Admin Only */}
            {canEdit && (
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Icons.settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link href="/settings">
                      <Button
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 mb-3"
                        variant="outline"
                      >
                        Farm Settings
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 mb-3"
                        variant="outline"
                      >
                        Backup Data
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 mb-3"
                        variant="outline"
                      >
                        System Logs
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white mb-3">
                        Advanced Admin Panel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-800">
                  <Icons.barChart className="h-5 w-5" />
                  Farm Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Total Animals:</strong> 0
                  </p>
                  <p>
                    <strong>Milk Production Today:</strong> 0L
                  </p>
                  <p>
                    <strong>Weekly Average:</strong> 0L
                  </p>
                  <p>
                    <strong>Last Activity:</strong> Now
                  </p>
                  {canEdit && (
                    <Link href="/reports">
                      <Button
                        size="sm"
                        className="w-full mt-3 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        variant="outline"
                      >
                        Detailed Analytics
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Role-based Information */}
          {!canEdit && (
            <div className="mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Icons.shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Employee Access</h3>
              </div>
              <p className="text-blue-700 text-sm">
                You have read-only access to most features. For administrative
                tasks like adding animals, editing records, or system settings,
                please contact your farm manager.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
