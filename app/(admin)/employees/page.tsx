"use client";

import { motion, type Variants } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUsers, useUserStats } from "@/hooks/use-employee-hooks";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { RingLoader } from "react-spinners";

// Animation variants
const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const canEdit = user?.role === "FARM_MANAGER";
  
  // Use hooks for data fetching
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers(currentPage, 10);

  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
  } = useUserStats();

  const stats = userStats?.stats;
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  const filteredUsers = users.filter(
    (userData: { username: string; email: string; }) =>
      userData.username.toLowerCase().includes(search.toLowerCase()) ||
      userData.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Employees Management
              </h1>
              <p className="text-gray-600">
                View and manage all farm employees and user accounts
              </p>
            </div>
            {canEdit && (
              <Link href="/employees/add">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* User Statistics */}
        <motion.div variants={fadeInUp} className="mb-8">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statsError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-600">
                  <Icons.alertCircle className="h-5 w-5 mr-2" />
                  <span>Error loading statistics: {statsError.message}</span>
                </div>
              </CardContent>
            </Card>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.totalUsers}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    Farm Managers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {stats.farmManagers}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">
                    Employees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.employees}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </motion.div>

        {/* Search and Users List */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Icons.search className="h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by username or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">
                  <RingLoader size={80} color="#3B82F6" className="mx-auto mb-4" />
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : usersError ? (
                <div className="text-center py-8">
                  <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">Error loading users: {usersError.message}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((userData: any, index: number) => (
                        <motion.tr
                          key={userData.username}
                          variants={cardVariants}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16">
                                {userData.image_url ? (
                                  <img
                                    src={userData.image_url}
                                    alt={userData.username}
                                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center border-2 border-gray-200">
                                    <span className="text-white font-semibold text-xl">
                                      {userData.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {userData.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  User ID: {userData.id ? "***" + userData.id.slice(-4) : "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{userData.email}</div>
                            <div className="text-sm text-gray-500">
                              <Icons.mail className="inline w-3 h-3 mr-1" />
                              Email Contact
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                                userData.role === "FARM_MANAGER"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }`}
                            >
                              {userData.role === "FARM_MANAGER" ? (
                                <Icons.crown className="w-4 h-4 mr-1" />
                              ) : (
                                <Icons.user className="w-4 h-4 mr-1" />
                              )}
                              {userData.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Icons.calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">
                                  {new Date(userData.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(userData.createdAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Icons.clock className="w-4 h-4 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">
                                  {new Date(userData.updatedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(userData.updatedAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center text-sm text-gray-700">
                    <Icons.users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">
                      Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(currentPage * pagination.limit, pagination.total)}
                    </span>
                    <span className="mx-1">of</span>
                    <span className="font-medium">{pagination.total}</span>
                    <span className="ml-1">users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500 mr-4">
                      Page {currentPage} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <Icons.chevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
                      }
                      disabled={currentPage === pagination.totalPages}
                      className="flex items-center"
                    >
                      Next
                      <Icons.chevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </motion.div>
      </motion.div>
    </div>
  );
}
