"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { RingLoader } from "react-spinners";
import { Employee } from "@/lib/types/employee";
import { UserTableProps } from "@/lib/types/user-table";
import { DesktopTableView } from "./desktop-table-view";
import { MobileCardView } from "./mobile-card-view";

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

export function UserTable({
  users,
  filteredUsers,
  search,
  onSearchChange,
  isLoading,
  error,
  canEdit,
  currentUser,
  pagination,
  currentPage,
  onPageChange,
  onEditEmployee,
  onDeleteEmployee,
}: UserTableProps) {
  const canEditEmployee = (employee: Employee): boolean => {
    if (!currentUser || !canEdit) return false;
    if (employee.id === currentUser.id) return true;
    
    if (currentUser.role === "FARM_MANAGER") {
      return employee.role === "EMPLOYEE";
    }
    
    return false;
  };

  const canDeleteEmployee = (employee: Employee): boolean => {
    if (!currentUser || !canEdit) return false;
    
    if (employee.id === currentUser.id) return false;
    if (currentUser.role === "FARM_MANAGER") {
      return employee.role === "EMPLOYEE";
    }
    
    return false;
  };

  return (
    <motion.div variants={fadeInUp} className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center space-x-4">
            <Icons.search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <Input
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
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
          {isLoading ? (
            <div className="text-center py-8">
              <RingLoader size={80} color="#3B82F6" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">Error loading users: {error.message}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Icons.users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <DesktopTableView
                filteredUsers={filteredUsers}
                canEdit={canEdit}
                currentUser={currentUser}
                onEditEmployee={onEditEmployee}
                onDeleteEmployee={onDeleteEmployee}
                canEditEmployee={canEditEmployee}
                canDeleteEmployee={canDeleteEmployee}
              />

              {/* Mobile Card View */}
              <MobileCardView
                filteredUsers={filteredUsers}
                canEdit={canEdit}
                currentUser={currentUser}
                onEditEmployee={onEditEmployee}
                onDeleteEmployee={onDeleteEmployee}
                canEditEmployee={canEditEmployee}
                canDeleteEmployee={canDeleteEmployee}
              />
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t-2 border-gray-200 rounded-b-lg gap-4">
              <div className="flex items-center text-sm font-semibold text-gray-800 order-2 sm:order-1">
                <Icons.users className="w-5 h-5 mr-2 text-gray-600" />
                <span className="font-bold">
                  Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>
                <span className="mx-1">of</span>
                <span className="font-bold">{pagination.total}</span>
                <span className="ml-1">users</span>
              </div>
              <div className="flex items-center space-x-3 order-1 sm:order-2">
                <div className="text-sm font-semibold text-gray-700 hidden sm:block">
                  Page {currentPage} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center font-semibold border-gray-300 hover:bg-gray-100"
                >
                  <Icons.chevronLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <div className="text-sm font-bold text-gray-700 sm:hidden bg-white px-3 py-1 rounded-md border">
                  {currentPage}/{pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onPageChange(Math.min(pagination.totalPages, currentPage + 1))
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center font-semibold border-gray-300 hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Next</span>
                  <Icons.chevronRight className="w-4 h-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
