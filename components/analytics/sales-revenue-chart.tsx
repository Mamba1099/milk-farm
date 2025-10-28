"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface SalesRevenueData {
  date: string;
  fullDate: string;
  totalRevenue: number;
  totalQuantity: number;
  salesCount: number;
  averagePrice: number;
  cashSales: number;
  mpesaSales: number;
}

export function SalesRevenueChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "sales-revenue"],
    queryFn: async () => {
      const response = await apiClient.get("/api/analytics/sales-revenue");
      return response.data as SalesRevenueData[];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.dollarSign className="h-5 w-5 text-green-600" />
            Sales Revenue Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <ClockLoader color="#059669" size={40} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.dollarSign className="h-5 w-5 text-green-600" />
            Sales Revenue Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load sales data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Icons.dollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          <span className="truncate">Daily Sales Revenue - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Mobile: Horizontal scroll container */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible chart-scroll">
          <div className="min-w-[800px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={data} 
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  interval={0}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Revenue (KES)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0] && payload[0].payload) {
                      return `Date: ${payload[0].payload.fullDate}`;
                    }
                    return `Day ${label}`;
                  }}
                  formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="totalRevenue" 
                  fill="#DC2626" 
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}