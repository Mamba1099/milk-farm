"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useSalesStats } from "@/hooks/use-sales-hooks";
import { ClockLoader } from "react-spinners";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function SalesStatsCards() {
  const { data: stats, isLoading, isError } = useSalesStats("today");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <ClockLoader color="#059669" size={40} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="text-center p-4 text-red-600">
        <Icons.alertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Failed to load sales statistics</p>
      </div>
    );
  }

  const period = "Today";
  
  const statCards = [
    {
      title: `Total Production ${period}`,
      value: `${(stats?.totalProduction || 0).toFixed(1)} L`,
      icon: Icons.milk,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Total milk production available"
    },
    {
      title: `Total Sales ${period}`, 
      value: `${(stats?.totalSales || 0).toFixed(1)} L`,
      icon: Icons.shoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50", 
      borderColor: "border-green-200",
      description: "Milk sold to customers"
    },
    {
      title: "Balance Remaining",
      value: `${(stats?.balanceRemaining || 0).toFixed(1)} L`,
      icon: Icons.database,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200", 
      description: "Available for sale"
    },
    {
      title: `Revenue ${period}`,
      value: `KSh ${(stats?.revenue || 0).toLocaleString()}`,
      icon: Icons.dollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      description: "Total sales revenue"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 min-w-0">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
          className="min-w-0"
        >
          <Card className={`${stat.bgColor} ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-gray-700">{stat.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}