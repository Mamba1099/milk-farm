"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

const todayStats = {
  totalProduction: 450,
  totalSales: 380, 
  averageSales: 12.5,
  quantitySold: 380,
  quantityNotSold: 70,
  revenue: 76000,
};

const customerSales = [
  {
    id: 1,
    customerName: "John Kamau",
    quantity: 20,
    price: 200,
    phone: "+254712345678",
    mpesaRef: "QGH7X9K2LM",
  },
  {
    id: 2,
    customerName: "Mary Wanjiku",
    quantity: 15,
    price: 150,
    phone: "+254723456789",
    mpesaRef: "PFL3M8N5RT",
  },
  {
    id: 3,
    customerName: "Peter Mwangi",
    quantity: 25,
    price: 250,
    phone: "+254734567890",
    mpesaRef: "QTR9K2M7NL",
  },
  {
    id: 4,
    customerName: "Grace Njeri",
    quantity: 10,
    price: 100,
    phone: "+254745678901",
    mpesaRef: "XYZ8L4P6QM",
  },
  {
    id: 5,
    customerName: "Samuel Kiprotich",
    quantity: 30,
    price: 300,
    phone: "+254756789012",
    mpesaRef: "ABC5N2R8TL",
  },
  {
    id: 6,
    customerName: "Rose Akinyi",
    quantity: 18,
    price: 180,
    phone: "+254767890123",
    mpesaRef: "DEF7Q4K9NM",
  },
  {
    id: 7,
    customerName: "David Otieno",
    quantity: 22,
    price: 220,
    phone: "+254778901234",
    mpesaRef: "GHI2M8L5TP",
  },
  {
    id: 8,
    customerName: "Ann Chebet",
    quantity: 12,
    price: 120,
    phone: "+254789012345",
    mpesaRef: "JKL6P3N9QR",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function SalesPage() {
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
                Sales Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor today's sales performance and customer transactions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm border border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Icons.milk className="w-4 h-4 text-blue-600" />
                Total Production Today
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-blue-900">{todayStats.totalProduction}L</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-sm border border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Icons.trendingUp className="w-4 h-4 text-green-600" />
                Total Sales Today
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-900">{todayStats.totalSales}L</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm border border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Icons.barChart className="w-4 h-4 text-purple-600" />
                Average Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-purple-900">{todayStats.averageSales}L</div>
              <div className="text-xs text-purple-600">per customer</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm border border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <Icons.check className="w-4 h-4 text-emerald-600" />
                Quantity Sold
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-emerald-900">{todayStats.quantitySold}L</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm border border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <Icons.alertCircle className="w-4 h-4 text-orange-600" />
                Quantity Not Sold
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-orange-900">{todayStats.quantityNotSold}L</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-sm border border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <Icons.dollarSign className="w-4 h-4 text-yellow-600" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-yellow-900">KES {todayStats.revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Sales Table */}
        <motion.div variants={fadeInUp}>
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Icons.users className="w-5 h-5 text-blue-600" />
                Today's Customer Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity (L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price (KES)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        M-Pesa Ref
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerSales.map((sale, index) => (
                      <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Icons.user className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {sale.customerName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">{sale.quantity}L</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">KES {sale.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{sale.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                            {sale.mpesaRef}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Footer */}
        <motion.div variants={fadeInUp} className="mt-6">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Icons.info className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Sales Summary: {customerSales.length} customers served today
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Efficiency: {((todayStats.quantitySold / todayStats.totalProduction) * 100).toFixed(1)}%</span>
                  <span>•</span>
                  <span>Avg per customer: {(todayStats.totalSales / customerSales.length).toFixed(1)}L</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
