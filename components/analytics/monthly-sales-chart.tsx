import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthlySalesData {
  month: string;
  monthNumber: number;
  totalQuantity: number;
  totalRevenue: number;
}

export function MonthlySalesChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const { data: monthlySales, isLoading } = useQuery<MonthlySalesData[]>({
    queryKey: ['monthly-sales', selectedYear],
    queryFn: async () => {
      const response = await apiClient.get(`/api/analytics/monthly-sales?year=${selectedYear}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
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
          <CardTitle>Monthly Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-80">
            <p>No monthly sales data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxQuantity = Math.max(...monthlySales.map(d => d.totalQuantity));
  const maxRevenue = Math.max(...monthlySales.map(d => d.totalRevenue));
  
  const revenueScale = maxQuantity > 0 ? maxQuantity / Math.max(maxRevenue, 1) : 1;

  const chartData = monthlySales.map(data => ({
    ...data,
    scaledRevenue: data.totalRevenue * revenueScale
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">Monthly Sales ({selectedYear})</CardTitle>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
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
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Mobile: Horizontal scroll container */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible chart-scroll">
          <div className="min-w-[600px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="quantity"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Quantity (L)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Revenue (KES)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'totalQuantity') {
                      return [`${value}L`, 'Quantity Sold'];
                    }
                    if (name === 'scaledRevenue') {
                      return [`${props.payload.totalRevenue} KES`, 'Revenue'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'totalQuantity') return 'Quantity (L)';
                    if (value === 'scaledRevenue') return 'Revenue (KES)';
                    return value;
                  }}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  yAxisId="quantity"
                  dataKey="totalQuantity" 
                  fill="#06B6D4" 
                  name="totalQuantity"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="revenue"
                  dataKey="scaledRevenue" 
                  fill="#F97316" 
                  name="scaledRevenue"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}