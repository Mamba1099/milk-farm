"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface SalesRevenueData {
  date: string;
  revenue: number;
  quantity: number;
  transactions: number;
}

export function SalesRevenueChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "sales-revenue"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.salesRevenue);
      return response.data as SalesRevenueData[];
    },
    staleTime: 5 * 60 * 1000,
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
        <CardTitle className="flex items-center gap-2">
          <Icons.dollarSign className="h-5 w-5 text-green-600" />
          Sales Revenue Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `KSh ${value.toLocaleString()}` :
                name === 'quantity' ? `${value} L` : `${value} transactions`,
                name === 'revenue' ? 'Revenue' :
                name === 'quantity' ? 'Quantity Sold' : 'Transactions'
              ]}
            />
            <Bar 
              dataKey="revenue" 
              fill="#10B981" 
              name="Revenue"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}