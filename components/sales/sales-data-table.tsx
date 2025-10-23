"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { useSales } from "@/hooks/use-sales-hooks";
import { ClockLoader } from "react-spinners";
import { format } from "date-fns";

export function SalesDataTable() {
  const { data, isLoading, isError } = useSales();

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icons.fileText className="h-5 w-5 text-green-600" />
            <span className="text-gray-800">Today's Sales</span>
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
            <span className="text-gray-800">Today's Sales</span>
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icons.fileText className="h-5 w-5 text-green-600" />
            <span className="text-gray-800">Today's Sales</span>
            <Badge variant="secondary" className="ml-auto">
              {sales.length} transactions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          {sales.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Icons.database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No sales recorded today</p>
                <p className="text-gray-400 text-sm">Sales will appear here once recorded</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              <div className="h-full overflow-x-auto overflow-y-auto">
                <div className="min-w-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 w-16 px-2">Time</TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[120px] px-2">Customer</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center w-20 px-2">Qty</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center w-24 px-2">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center w-20 px-2">Pay</TableHead>
                        <TableHead className="font-semibold text-gray-700 w-16 px-2">By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale, index) => (
                        <TableRow 
                          key={sale.id} 
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition-colors`}
                        >
                          <TableCell className="font-medium text-xs p-2">
                            {format(new Date(sale.timeRecorded), "HH:mm")}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center gap-1 min-w-0">
                              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Icons.user className="h-2 w-2 text-green-600" />
                              </div>
                              <span className="font-medium text-gray-900 truncate text-xs">
                                {sale.customerName || "Anonymous"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center p-2">
                            <span className="font-medium text-gray-900 text-xs">
                              {sale.quantity.toFixed(1)}L
                            </span>
                          </TableCell>
                          <TableCell className="text-center p-2">
                            <span className="font-bold text-green-600 text-xs">
                              {sale.totalAmount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center p-2">
                            <div className="flex justify-center">
                              {sale.payment_method === "MPESA" ? (
                                <Icons.dollarSign className="h-3 w-3 text-green-600" />
                              ) : (
                                <Icons.coins className="h-3 w-3 text-gray-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <span className="text-xs text-gray-600 truncate block">
                              {sale.soldBy?.username?.slice(0, 4) || "?"}
                            </span>
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