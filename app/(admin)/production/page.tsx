"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Search,
  Filter,
  Milk,
  Eye,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import {
  useProductionData,
  useProductionStats,
} from "@/hooks/use-production-hooks";
import { formatDate } from "@/lib/utils";
import { ProductionRecordsList } from "@/components/production/production-records-list";

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
      ease: [0.25, 0.1, 0.25, 1],
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
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function ProductionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("today");

  const {
    morningProductions,
    eveningProductions,
    isLoading: productionLoading,
    refetch: refetchProduction,
  } = useProductionData(selectedDateRange);
  const { data: stats, isLoading: statsLoading } = useProductionStats();

  const morningTotal = morningProductions?.reduce((sum: number, record: any) => sum + (record.quantity_am || 0), 0) || 0;
  const eveningTotal = eveningProductions?.reduce((sum: number, record: any) => sum + (record.quantity_pm || 0), 0) || 0;

  const allProductions = [...(morningProductions || []), ...(eveningProductions || [])];
  const filteredProductionData = allProductions.filter(
    (record: any) =>
      record.animal.tagNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animal.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productionStats = {
    todayProduction: stats?.todayProduction || 0,
    weekProduction: stats?.weekProduction || 0,
    monthProduction: stats?.monthProduction || 0,
    activeAnimals: stats?.activeAnimals || 0,
    morningTotal,
    eveningTotal,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div
        className="mx-2"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Production Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track daily milk production and sales records
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Button
              onClick={() => router.push("/production/add")}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <Milk size={18} className="sm:w-5 sm:h-5" />
              Add Production
            </Button>
          )}
        </motion.div>

      {/* Production Statistics & Records */}
      <ProductionRecordsList
        records={filteredProductionData}
        stats={productionStats}
        userRole={user?.role}
        showStats={true}
        title="Production Records"
      />

  {/* Production Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search by animal tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="all">All Time</option>
            </select>
            {/* Removed tab buttons for Production/Sales */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedDateRange("today");
              }}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <Filter size={16} className="sm:w-5 sm:h-5" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

  {/* Production Records */}
  <motion.div className="space-y-4" variants={fadeInUp}>
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Production Records</h3>
        {productionLoading && (
          <div className="text-sm text-gray-500">Loading...</div>
        )}
      </div>

      {filteredProductionData.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-500 mb-4 text-sm sm:text-base">
            No production records found
          </div>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            Start tracking milk production by adding daily records
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Morning (L)</TableHead>
                <TableHead>Evening (L)</TableHead>
                <TableHead>Total (L)</TableHead>
                <TableHead>Calf Deduction</TableHead>
                <TableHead>Net Production</TableHead>
                <TableHead>Status</TableHead>
                {(user?.role === "FARM_MANAGER" || user?.role === "EMPLOYEE") && (
                  <TableHead>Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductionData.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {record.animal.tagNumber}
                      </div>
                      {record.animal.name && (
                        <div className="text-sm text-gray-500">
                          {record.animal.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{record.morningQuantity}L</TableCell>
                  <TableCell>{record.eveningQuantity}L</TableCell>
                  <TableCell className="font-medium">
                    {record.totalQuantity}L
                  </TableCell>
                  <TableCell>{record.calfQuantity}L</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {record.availableForSales}L
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.carryOverQuantity > 0
                          ? "warning"
                          : "success"
                      }
                    >
                      {record.carryOverQuantity > 0
                        ? `${record.carryOverQuantity}L Carry`
                        : "Recorded"}
                    </Badge>
                  </TableCell>
                  {(user?.role === "FARM_MANAGER" || user?.role === "EMPLOYEE") && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye size={16} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  </motion.div>
  </motion.div>
    </div>
  );
}
