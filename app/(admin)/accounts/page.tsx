"use client";

import { motion, type Variants } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useUsers, useUserStats, useDeleteUser } from "@/hooks/use-employee-hooks";
import { RingLoader } from "react-spinners";
import { EmployeeEditForm, UserStatistics, UserTable, CurrentUserProfileCard } from "@/components/employees";
import { Employee } from "@/lib/types/employee";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

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

export default function EmployeesPage() {
  const { user, canEdit } = useAuth();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const deleteUserMutation = useDeleteUser();
  
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

  // Separate current user from other users
  const otherUsers = users.filter((userData: Employee) => userData.id !== user?.id);
  
  const filteredUsers = otherUsers.filter(
    (userData: Employee) =>
      userData.username.toLowerCase().includes(search.toLowerCase()) ||
      userData.email.toLowerCase().includes(search.toLowerCase())
  );

  // Find current user in the users list
  const currentUserProfile = users.find((userData: Employee) => userData.id === user?.id);

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeletingEmployee(employee);
  };

  const confirmDelete = () => {
    if (deletingEmployee) {
      deleteUserMutation.mutate(deletingEmployee.id);
      setDeletingEmployee(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-2 sm:p-4 lg:p-6 xl:p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-6 lg:mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Employee Management and Account Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage accounts - edit, delete accounts
              </p>
            </div>
          </div>
        </motion.div>

        {/* User Statistics */}
        <UserStatistics 
          stats={stats} 
          isLoading={statsLoading} 
          error={statsError} 
        />

        {/* Current User Profile */}
        {currentUserProfile && (
          <motion.div variants={fadeInUp}>
            <CurrentUserProfileCard
              user={currentUserProfile}
              onEdit={() => setEditingEmployee(currentUserProfile)}
            />
          </motion.div>
        )}

        {/* Separator */}
        <motion.div variants={fadeInUp} className="mb-8 -mx-2 sm:-mx-4 lg:-mx-6 xl:-mx-8">
          <div className="relative px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-screen border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 py-2 bg-white text-gray-600 font-semibold rounded-full shadow-sm border border-gray-200">
                Other Team Members
              </span>
            </div>
          </div>
        </motion.div>

        {/* Other Users Table */}
        <UserTable
          users={otherUsers}
          filteredUsers={filteredUsers}
          search={search}
          onSearchChange={setSearch}
          isLoading={usersLoading}
          error={usersError}
          canEdit={canEdit}
          currentUser={
            user
              ? {
                  ...user,
                  role: user.role === "FARM_MANAGER" ? "FARM_MANAGER" : "EMPLOYEE",
                }
              : undefined
          }
          pagination={
            pagination
              ? {
                  total: pagination.total,
                  totalPages: pagination.totalPages,
                  currentPage: pagination.page,
                  limit: pagination.limit,
                }
              : undefined
          }
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <EmployeeEditForm
            user={editingEmployee}
            isOpen={!!editingEmployee}
            onClose={() => setEditingEmployee(null)}
            onSuccess={() => {
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Employee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingEmployee?.username}? This action cannot be undone.
                {deletingEmployee?.id === user?.id && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-sm">
                    ⚠️ You cannot delete your own account.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deletingEmployee?.id === user?.id || deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <RingLoader size={16} color="white" />
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}
