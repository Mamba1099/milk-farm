import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiClient } from "@/lib/api-client";

interface MonthlyProductionData {
  month: string;
  monthNumber: number;
  totalMorningProduction: number;
  totalEveningProduction: number;
  totalDailyProduction: number;
}

export function MonthlyProductionChart() {
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
          <CardTitle>Monthly Production</CardTitle>
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
          <CardTitle>Monthly Production</CardTitle>
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
        <CardTitle className="text-base sm:text-lg">Monthly Production ({new Date().getFullYear()})</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Mobile: Horizontal scroll container */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible chart-scroll">
          <div className="min-w-[600px] lg:min-w-full">
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
                  formatter={(value, name) => [
                    `${value}L`,
                    name === 'totalMorningProduction' ? 'Morning Production' :
                    name === 'totalEveningProduction' ? 'Evening Production' : 'Total Production'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => {
                    if (value === 'totalMorningProduction') return 'Morning Production';
                    if (value === 'totalEveningProduction') return 'Evening Production';
                    if (value === 'totalDailyProduction') return 'Total Production';
                    return value;
                  }}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="totalMorningProduction" 
                  fill="#8884d8" 
                  name="totalMorningProduction"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="totalEveningProduction" 
                  fill="#82ca9d" 
                  name="totalEveningProduction"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="totalDailyProduction" 
                  fill="#ff7300" 
                  name="totalDailyProduction"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}