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

interface SalesStatsCardsProps {
  dateFilter: string;
  customDate?: Date;
}

export function SalesStatsCards({ dateFilter, customDate }: SalesStatsCardsProps) {
  const getSpecificDate = () => {
    const localToday = new Date();
    const todayLocal = new Date(Date.UTC(
      localToday.getFullYear(),
      localToday.getMonth(),
      localToday.getDate()
    ));

    switch (dateFilter) {
      case "yesterday":
        const yesterday = new Date(todayLocal);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        return yesterday.toISOString().split('T')[0];
      case "custom":
        return customDate ? new Date(Date.UTC(
          customDate.getFullYear(),
          customDate.getMonth(),
          customDate.getDate()
        )).toISOString().split('T')[0] : undefined;
      case "today":
        return todayLocal.toISOString().split('T')[0];
      default:
        return undefined;
    }
  };

  const getTimeframe = () => {
    switch (dateFilter) {
      case "week":
        return "week";
      case "month":
        return "month";
      default:
        return "today";
    }
  };

  const specificDate = getSpecificDate();
  const timeframe = getTimeframe() as 'today' | 'week' | 'month';
  
  const { data: stats, isLoading, isError } = useSalesStats(
    timeframe, 
    specificDate
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 min-w-0">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
          className="min-w-0"
        >
          <Card className={`${stat.bgColor} ${stat.borderColor} hover:shadow-lg transition-all duration-300 flex flex-col h-full justify-between`}>
            <CardHeader className="pb-2 flex flex-col items-center">
              <div className="flex flex-col items-center w-full mt-0">
                <stat.icon className={`h-6 w-8 ${stat.color}`} />
                <CardTitle className="text-center text-base font-semibold leading-tight break-words w-full">
                  <span className="text-gray-700">{stat.title}</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className=" flex flex-col items-center justify-center flex-1 w-full">
              <div className="space-y-1 w-full flex flex-col items-center">
                <p className={`text-2xl font-bold ${stat.color} text-center break-words w-full`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 text-center break-words w-full">
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