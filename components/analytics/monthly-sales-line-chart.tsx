import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlySalesData {
  month: string;
  monthNumber: number;
  totalQuantity: number;
  totalRevenue: number;
}

export function MonthlySalesLineChart() {
  const { data: monthlySales, isLoading } = useQuery<MonthlySalesData[]>({
    queryKey: ['monthly-sales'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.monthlySales);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Sales (Trend)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-80">
            <p>Loading monthly sales data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!monthlySales || monthlySales.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Sales (Trend)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-80">
            <p>No monthly sales data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...monthlySales.map(d => d.totalRevenue));
  const yAxisMax = Math.ceil(maxRevenue * 1.1);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Monthly Sales Trend ({new Date().getFullYear()})</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Mobile: Horizontal scroll container */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible chart-scroll">
          <div className="min-w-[500px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlySales} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }} 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, yAxisMax]} 
                  tick={{ fontSize: 10 }} 
                  label={{ value: 'Revenue (KES)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} 
                />
                <Tooltip 
                  formatter={(value, name) => [`${value}`, name === 'totalRevenue' ? 'Revenue (KES)' : 'Quantity (L)']} 
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="totalRevenue" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
