"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useState } from "react";

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
  const [searchTerm, setSearchTerm] = useState("");

  // Mock employee data - replace with real data from your API
  const employees = [
    {
      id: 1,
      name: "John Smith",
      email: "john@milkfarm.com",
      role: "EMPLOYEE",
      joinDate: "2024-01-15",
      status: "Active",
      avatar: null,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@milkfarm.com",
      role: "EMPLOYEE",
      joinDate: "2024-03-20",
      status: "Active",
      avatar: null,
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike@milkfarm.com",
      role: "EMPLOYEE",
      joinDate: "2024-02-10",
      status: "Inactive",
      avatar: null,
    },
  ];

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Button className="flex items-center gap-2 bg-[#2d5523] hover:bg-[#1e3a1a] text-white w-full sm:w-auto text-sm sm:text-base">
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
                    placeholder="Search employees by name or email..."
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
                    {employees.length}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600">
                    Total Employees
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
                    {employees.filter((e) => e.status === "Active").length}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600">
                    Active
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
                    {employees.filter((e) => e.status === "Inactive").length}
                  </div>
                  <div className="text-xs sm:text-sm text-orange-600">
                    Inactive
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
                    1
                  </div>
                  <div className="text-xs sm:text-sm text-purple-600">
                    Farm Managers
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Employee List */}
        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredEmployees.map((employee, index) => (
            <motion.div
              key={employee.id}
              variants={cardVariants}
              custom={index}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icons.user className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {employee.name}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm truncate">
                          {employee.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Joined:{" "}
                            {new Date(employee.joinDate).toLocaleDateString()}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              employee.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {employee.status}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {employee.role === "FARM_MANAGER"
                              ? "Farm Manager"
                              : "Employee"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Icons.eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        View
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50 flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            <Icons.settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50 flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            <Icons.trash className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredEmployees.length === 0 && (
          <motion.div className="text-center py-12" variants={fadeInUp}>
            <div className="text-gray-500 mb-4 text-sm sm:text-base">
              No employees found
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by adding your first employee"}
            </p>
            {canEdit && !searchTerm && (
              <Button className="bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-sm sm:text-base">
                Add First Employee
              </Button>
            )}
          </motion.div>
        )}

        {/* Role-based Information */}
        {!canEdit && (
          <motion.div
            className="mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icons.shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800 text-sm sm:text-base">
                View-Only Access
              </h3>
            </div>
            <p className="text-blue-700 text-xs sm:text-sm">
              You can view employee information but cannot add, edit, or remove
              employees. Contact your farm manager for any changes needed.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
