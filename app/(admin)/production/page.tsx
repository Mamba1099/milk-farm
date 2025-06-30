"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Milk,
  Eye,
  Edit,
  DollarSign,
  BarChart3,
} from "lucide-react";
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
  useSalesData,
  useProductionStats,
} from "@/hooks/use-production-hooks";
import { ProductionForm } from "@/components/production/production-form";
import { SalesForm } from "@/components/production/sales-form";
import { formatDate, formatCurrency } from "@/lib/utils";

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

export default function ProductionPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [activeTab, setActiveTab] = useState<"production" | "sales">(
    "production"
  );
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);

  // Data queries
  const {
    data: productionData,
    isLoading: productionLoading,
    refetch: refetchProduction,
  } = useProductionData(selectedDateRange);
  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useSalesData(selectedDateRange);
  const { data: stats, isLoading: statsLoading } = useProductionStats();

  // Filter data based on search term
  const filteredProductionData =
    productionData?.filter(
      (record) =>
        record.animal.tagNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.animal.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredSalesData =
    salesData?.filter((record) =>
      record.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleFormSuccess = () => {
    refetchProduction();
    refetchSales();
    setShowProductionForm(false);
    setShowSalesForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowProductionForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 flex-1 sm:flex-none justify-center text-sm sm:text-base"
              >
                <Milk size={18} className="sm:w-5 sm:h-5" />
                Add Production
              </Button>
              <Button
                onClick={() => setShowSalesForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 flex-1 sm:flex-none justify-center text-sm sm:text-base"
              >
                <DollarSign size={18} className="sm:w-5 sm:h-5" />
                Record Sale
              </Button>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={cardVariants}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Today&apos;s Production
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {statsLoading ? "..." : `${stats?.todayProduction || 0}L`}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">This Week</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {statsLoading ? "..." : `${stats?.weekProduction || 0}L`}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Active Animals
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {statsLoading ? "..." : stats?.activeAnimals || 0}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-purple-600 rounded-full"></div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Monthly Sales
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {statsLoading
                      ? "..."
                      : formatCurrency(stats?.monthlySales || 0)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
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
                placeholder={
                  activeTab === "production"
                    ? "Search by animal tag..."
                    : "Search by customer..."
                }
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
            <div className="flex gap-2">
              <Button
                variant={activeTab === "production" ? "default" : "outline"}
                onClick={() => setActiveTab("production")}
                className="flex-1 text-sm"
              >
                Production
              </Button>
              <Button
                variant={activeTab === "sales" ? "default" : "outline"}
                onClick={() => setActiveTab("sales")}
                className="flex-1 text-sm"
              >
                Sales
              </Button>
            </div>
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
          {activeTab === "production" ? (
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
                  {user?.role === "FARM_MANAGER" && (
                    <Button
                      onClick={() => setShowProductionForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                    >
                      Add First Production Record
                    </Button>
                  )}
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
                        {user?.role === "FARM_MANAGER" && (
                          <TableHead>Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProductionData.map((record) => (
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
                          {user?.role === "FARM_MANAGER" && (
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
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sales Records</h3>
                {salesLoading && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
              </div>

              {filteredSalesData.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-500 mb-4 text-sm sm:text-base">
                    No sales records found
                  </div>
                  <p className="text-gray-400 mb-6 text-sm sm:text-base">
                    Start recording milk sales to track revenue
                  </p>
                  {user?.role === "FARM_MANAGER" && (
                    <Button
                      onClick={() => setShowSalesForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                    >
                      Record First Sale
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Quantity (L)</TableHead>
                        <TableHead>Price/L</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Payment Status</TableHead>
                        {user?.role === "FARM_MANAGER" && (
                          <TableHead>Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalesData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell className="font-medium">
                            {record.customerName || "N/A"}
                          </TableCell>
                          <TableCell>N/A</TableCell>
                          <TableCell>{record.quantity}L</TableCell>
                          <TableCell>
                            {formatCurrency(record.pricePerLiter)}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(record.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="success">Completed</Badge>
                          </TableCell>
                          {user?.role === "FARM_MANAGER" && (
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
          )}
        </motion.div>
      </motion.div>

      {/* Forms */}
      {showProductionForm && (
        <ProductionForm
          isOpen={showProductionForm}
          onClose={() => setShowProductionForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showSalesForm && (
        <SalesForm
          isOpen={showSalesForm}
          onClose={() => setShowSalesForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
