"use client";

import { motion, type Variants } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EmployeeEditForm } from "@/components/employees/employee-edit-form";
import { useUsers, useDeleteUser } from "@/hooks/use-employee-hooks";
import { Employee } from "@/lib/types/employee";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<Employee | null>(null);

  const canEdit = user?.role === "FARM_MANAGER";

  const {
    data: usersData,
    isLoading,
    error,
  } = useUsers(currentPage, 10);

  const deleteUserMutation = useDeleteUser();

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleFormSuccess = () => {
    setEditingUser(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Icons.alertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Employees
              </h3>
              <p className="text-gray-600 mb-4">
                Unable to load employee data. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Employee Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {canEdit
              ? "Manage your farm's employee accounts and permissions"
              : "View employee information and contact details"}
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Team Members ({pagination?.total || 0})
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search employees..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  {canEdit && (
                    <Link href="/employees/add">
                      <Button className="w-full sm:w-auto">
                        <Icons.plus className="h-4 w-4 mr-2" />
                        Add Employee
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <RingLoader size={40} color="#22c55e" />
                    <p className="text-gray-600">Loading employees...</p>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Icons.users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {search ? "No matching employees" : "No employees yet"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {search
                      ? "Try adjusting your search terms"
                      : "Get started by adding your first employee"}
                  </p>
                  {canEdit && !search && (
                    <Link href="/employees/add">
                      <Button>
                        <Icons.plus className="h-4 w-4 mr-2" />
                        Add First Employee
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((employee) => (
                    <div
                      key={employee.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                            {employee.image ? (
                              <Image
                                src={employee.image}
                                alt={employee.username}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Icons.user className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {employee.username}
                            </h4>
                            <p className="text-sm text-gray-600">{employee.email}</p>
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                employee.role === "FARM_MANAGER"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {employee.role === "FARM_MANAGER" ? "Farm Manager" : "Employee"}
                            </span>
                          </div>
                        </div>

                        {canEdit && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(employee)}
                              className="text-xs"
                            >
                              <Icons.edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(employee.id, employee.username)}
                              disabled={deleteUserMutation.isPending}
                              className="text-xs text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                            >
                              {deleteUserMutation.isPending ? (
                                <RingLoader size={12} color="#dc2626" />
                              ) : (
                                <>
                                  <Icons.trash className="h-3 w-3 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, pagination.total)} of{" "}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(pagination.totalPages, currentPage + 1)
                        )
                      }
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Role-based Information */}
        {!canEdit && (
          <motion.div
            className="mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icons.shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Employee Access</h3>
            </div>
            <p className="text-blue-700 text-sm sm:text-base">
              You have read-only access to employee information. For managing
              employees or administrative tasks, please contact your farm
              manager.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Form Modal */}
      {editingUser && (
        <EmployeeEditForm
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
