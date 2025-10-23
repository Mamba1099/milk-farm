"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockLoader } from "react-spinners";
import { Icons } from "@/components/icons";
import { MpesaIntegrationCard } from "@/components/sales/mpesa-integration-card";
import { SalesStatsCards } from "@/components/sales/sales-stats-cards";
import { SalesForm } from "@/components/sales/sales-form";
import { SalesDataTable } from "@/components/sales/sales-data-table";

function SalesPageContent() {
  return (
    <div className="relative">
      {/* Page Container with Controlled Overflow */}
      <div className="max-w-none w-full">
        {/* Header Section - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                <Icons.dollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
                <p className="text-gray-600 text-sm">Record and track milk sales transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
                <Icons.upload className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
                <Icons.fileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Single Scrollable Content Area */}
        <div className="h-full overflow-y-auto px-6 py-6">
          <div className="space-y-6 min-w-0">
            {/* M-Pesa Integration Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full min-w-0"
            >
              <MpesaIntegrationCard />
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full min-w-0"
            >
              <SalesStatsCards />
            </motion.div>

            {/* Main Content Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0"
            >
              {/* Sales Form - Smaller Width */}
              <div className="order-1 lg:order-1 lg:col-span-1 min-w-0">
                <SalesForm />
              </div>

              {/* Sales Data Table - Larger Width */}
              <div className="order-2 lg:order-2 lg:col-span-2 min-w-0">
                <SalesDataTable />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <ClockLoader color="#059669" size={60} />
      </div>
    }>
      <SalesPageContent />
    </Suspense>
  );
}