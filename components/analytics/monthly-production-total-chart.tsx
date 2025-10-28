import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyProductionData {
  month: string;
  monthNumber: number;
  totalMorningProduction: number;
  totalEveningProduction: number;
  totalDailyProduction: number;
}

export function MonthlyProductionTotalChart() {
  const { data: monthlyProduction, isLoading } = useQuery<MonthlyProductionData[]>({
    queryKey: ['monthly-production'],
    queryFn: async () => {
      const response = await apiClient.get("/api/analytics/monthly-production");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Total Production</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-80">
            <p>Loading monthly production data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!monthlyProduction || monthlyProduction.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Total Production</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-80">
            <p>No monthly production data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxProduction = Math.max(...monthlyProduction.map(d => d.totalDailyProduction));
  const yAxisMax = Math.ceil(maxProduction * 1.1);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Monthly Total Production ({new Date().getFullYear()})</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Mobile: Horizontal scroll container */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible chart-scroll">
          <div className="min-w-[500px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyProduction} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                  label={{ value: 'Liters', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}L`, 'Total Production']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="totalDailyProduction" 
                  fill="#7C3AED" 
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