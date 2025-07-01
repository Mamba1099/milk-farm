"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { EmployeeCreateForm } from "@/components/employees/employee-create-form";
import { EmployeeEditForm } from "@/components/employees/employee-edit-form";
import { useUsers, useDeleteUser, type User } from "@/hooks";

// Animation variants
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
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

const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function EmployeesPage() {
  const { canEdit } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users from backend
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useUsers(currentPage, 10);
  const deleteUserMutation = useDeleteUser();

  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination;

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    )
      return;

    try {
      await deleteUserMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete employee";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    // Refresh the user list (you might want to implement refetch in your hook)
    setShowCreateModal(false);
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9] p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9] p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Icons.alertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Employees
            </h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9] p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="mb-6 sm:mb-8" variants={fadeInUp}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Employee Management
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Manage farm employees and their permissions
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-[#2d5523] hover:bg-[#1e3a1a] text-white w-full sm:w-auto text-sm sm:text-base"
              >
                <Icons.userPlus className="h-4 w-4" />
                Add New Employee
              </Button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={fadeInUp}>
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full sm:w-auto">
                  <Input
                    placeholder="Search employees by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 w-full sm:w-auto text-sm"
                >
                  <Icons.search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Employee Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-800">
                    {pagination?.total || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600">
                    Total Users
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-800">
                    {users.filter((u) => u.role === "EMPLOYEE").length}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600">
                    Employees
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-800">
                    {users.filter((u) => u.role === "FARM_MANAGER").length}
                  </div>
                  <div className="text-xs sm:text-sm text-orange-600">
                    Farm Managers
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-800">
                    {filteredUsers.length}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-600">
                    Search Results
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Employee List */}
        <motion.div variants={fadeInUp}>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Employee List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No employees found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "No employees have been added yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow space-y-3 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={`${user.username}'s avatar`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <Icons.user className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {user.username}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {user.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "FARM_MANAGER"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role === "FARM_MANAGER"
                                ? "Manager"
                                : "Employee"}
                            </span>
                            <span className="text-xs text-gray-500">
                              Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            className="text-xs w-full sm:w-auto"
                          >
                            <Icons.settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-xs text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 w-full sm:w-auto"
                          >
                            <Icons.trash className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
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

      {/* Forms */}
      <EmployeeCreateForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleFormSuccess}
      />

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
