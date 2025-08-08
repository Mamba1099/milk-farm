"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Shield, Users } from "lucide-react";
import Link from "next/link";
import EmployeeCreateForm from "@/components/employees/employee-create-form";

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

const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function AddEmployeePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <motion.div 
          className="mb-8"
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <Link href="/employees">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Add New Employee
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Create a new employee account for your farm management system
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Access</h3>
                <p className="text-sm text-gray-600">Role-based permissions and encrypted passwords</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Management</h3>
                <p className="text-sm text-gray-600">Assign roles and manage farm operations</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="max-w-2xl mx-auto"
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center justify-center space-x-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                <span>Employee Information</span>
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Fill in the details below to create a new employee account
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <EmployeeCreateForm />
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Information
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Passwords must be at least 8 characters long</p>
                <p>• Must contain uppercase, lowercase, and numeric characters</p>
                <p>• Farm Managers have full access to all farm operations</p>
                <p>• Employees have limited access based on their role</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
