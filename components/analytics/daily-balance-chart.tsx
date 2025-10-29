"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { apiClient } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface DailyBalanceData {
  date: string;
  balance: number;
  day: number;
}

interface DailyBalanceResponse {
  success: boolean;
  data: DailyBalanceData[];
  month: number;
  year: number;
  totalDays: number;
}

const DailyBalanceChart = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const {
    data: dailyBalanceData,
    isLoading,
    error,
    refetch,
  } = useQuery<DailyBalanceResponse, Error>({
    queryKey: ["analytics", "daily-balance", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/analytics/daily-balance?month=${selectedMonth}&year=${selectedYear}`
      );
      return response.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Generate years (current year and 2 years back)
  const years = Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() - i);

  const chartData = dailyBalanceData?.data || [];

  const formatTooltip = (value: number, name: string) => {
    if (name === "balance") {
      return [`${value.toFixed(1)}L`, "Final Balance"];
    }
    return [value, name];
  };

  const formatXAxisLabel = (day: number) => {
    return day.toString().padStart(2, '0');
  };

  const averageBalance = chartData.length > 0 
    ? chartData.reduce((sum, item) => sum + item.balance, 0) / chartData.length 
    : 0;

  const maxBalance = chartData.length > 0 
    ? Math.max(...chartData.map(item => item.balance)) 
    : 0;

  const daysWithBalance = chartData.filter(item => item.balance > 0).length;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icons.barChart className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">Daily Balance Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center h-64">
            <ClockLoader color="#2563eb" size={40} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icons.barChart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold">Daily Balance Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <Icons.alertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load daily balance data</p>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4" size="sm">
              <Icons.refreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Icons.barChart className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">Daily Balance Overview</CardTitle>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-full sm:w-24">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Icons.droplets className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Avg Balance</span>
            </div>
            <p className="text-lg font-bold text-blue-700 mt-1">
              {averageBalance.toFixed(1)}L
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Icons.trendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Peak Balance</span>
            </div>
            <p className="text-lg font-bold text-green-700 mt-1">
              {maxBalance.toFixed(1)}L
            </p>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Icons.calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Active Days</span>
            </div>
            <p className="text-lg font-bold text-orange-700 mt-1">
              {daysWithBalance}/{chartData.length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Icons.percent className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Activity Rate</span>
            </div>
            <p className="text-lg font-bold text-purple-700 mt-1">
              {chartData.length > 0 ? ((daysWithBalance / chartData.length) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="day"
                tickFormatter={formatXAxisLabel}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
                label={{ 
                  value: "Balance (Liters)", 
                  angle: -90, 
                  position: "insideLeft",
                  style: { textAnchor: "middle", fontSize: "12px", fill: "#6b7280" }
                }}
              />
              <Tooltip
                formatter={formatTooltip}
                labelFormatter={(day) => `Day ${day}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Bar
                dataKey="balance"
                fill="#3b82f6"
                name="Final Balance"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Daily milk balance remaining after sales for{" "}
            <span className="font-semibold">
              {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyBalanceChart;