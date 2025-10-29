"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useSales } from "@/hooks/use-sales-hooks";
import { DatePicker } from "@/components/ui/date-picker";
import { ClockLoader } from "react-spinners";
import { format } from "date-fns";
import { Search, Filter, Calendar as CalendarIcon } from "lucide-react";

interface SalesDataTableProps {
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  customDate?: Date;
  setCustomDate: (date: Date | undefined) => void;
}

export function SalesDataTable({ 
  dateFilter, 
  setDateFilter, 
  customDate, 
  setCustomDate 
}: SalesDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);

  const { data, isLoading, isError } = useSales(dateFilter, customDate);

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    if (value === "custom") {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      setCustomDate(undefined);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("today");
    setCustomDate(undefined);
    setShowCustomDate(false);
  };

  const getTitle = () => {
    switch (dateFilter) {
      case "today":
        return "Today's Sales";
      case "yesterday":
        return "Yesterday's Sales";
      case "custom":
        return customDate ? `Sales for ${format(customDate, "MMM dd, yyyy")}` : "Custom Date Sales";
      case "week":
        return "This Week's Sales";
      case "month":
        return "This Month's Sales";
      case "all":
        return "All Sales";
      default:
        return "Sales";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icons.fileText className="h-5 w-5 text-green-600" />
            <span className="text-gray-800">{getTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <ClockLoader color="#059669" size={60} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icons.fileText className="h-5 w-5 text-green-600" />
            <span className="text-gray-800">{getTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load sales data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sales = data?.sales || [];
  
  const filteredSales = sales.filter(sale =>
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg mb-4">
            <Icons.fileText className="h-5 w-5 text-green-600" />
            <span className="text-gray-800">{getTitle()}</span>
            <Badge variant="secondary" className="ml-auto">
              {filteredSales.length} transactions
            </Badge>
          </CardTitle>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm h-9"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-9"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Custom Date Picker */}
            {showCustomDate && (
              <div className="col-span-1">
                <DatePicker
                  date={customDate}
                  onDateChange={setCustomDate}
                  placeholder="Select date"
                  className="text-sm h-9"
                />
              </div>
            )}

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2 text-sm h-9"
              size="sm"
            >
              <Filter size={14} />
              Clear
            </Button>
          </div>

          {/* Show selected custom date info */}
          {showCustomDate && customDate && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <CalendarIcon size={14} />
                <span>Showing sales for: {format(customDate, "PPP")}</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          {filteredSales.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Icons.database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm ? "No sales found matching your search" : "No sales recorded"}
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? "Try adjusting your search criteria" : "Sales will appear here once recorded"}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              <div className="h-full overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="min-w-[700px]">
                  <Table className="min-w-full">
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                      <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                        <TableHead className="font-semibold text-gray-700 text-xs px-3 py-3 w-[80px]">Time</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs px-3 py-3 min-w-[140px]">Customer</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs text-center px-3 py-3 w-[80px]">Quantity</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs text-right px-3 py-3 w-[100px]">Amount (KSh)</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs text-center px-3 py-3 w-[80px]">Payment</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs px-3 py-3 w-[70px]">Sold By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale, index) => (
                        <TableRow 
                          key={sale.id} 
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-green-50 transition-all duration-200 border-b border-gray-100`}
                        >
                          <TableCell className="font-medium text-xs px-3 py-4 text-gray-600">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">
                                {format(new Date(sale.timeRecorded), "HH:mm")}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {format(new Date(sale.timeRecorded), "dd/MM")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                                <Icons.user className="h-3 w-3 text-green-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-gray-900 truncate block text-sm">
                                  {sale.customerName || "Anonymous Customer"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ID: {sale.id.slice(-6).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-3 py-4">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-gray-900 text-sm">
                                {sale.quantity.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                Liters
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-3 py-4">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-green-600 text-sm">
                                {sale.totalAmount.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                KSh {(sale.totalAmount / sale.quantity).toFixed(0)}/L
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-3 py-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`p-2 rounded-full ${
                                sale.payment_method === "MPESA" 
                                  ? "bg-green-100 text-green-600" 
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {sale.payment_method === "MPESA" ? (
                                  <Icons.smartphone className="h-3 w-3" />
                                ) : (
                                  <Icons.coins className="h-3 w-3" />
                                )}
                              </div>
                              <span className="text-[10px] font-medium text-gray-600">
                                {sale.payment_method}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <div className="flex flex-col items-start">
                              <span className="text-xs font-medium text-gray-900 truncate block max-w-[60px]">
                                {sale.soldBy?.username || "Unknown"}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {sale.soldBy?.role === "FARM_MANAGER" ? "Manager" : "Employee"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}