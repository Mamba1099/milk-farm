import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthlyProductionData {
  month: string;
  monthNumber: number;
  totalMorningProduction: number;
  totalEveningProduction: number;
  totalDailyProduction: number;
}

export function MonthlyProductionComboChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const { data: monthlyProduction, isLoading } = useQuery<MonthlyProductionData[]>({
    queryKey: ['monthly-production', selectedYear],
    queryFn: async () => {
      const response = await apiClient.get(`/api/analytics/monthly-production?year=${selectedYear}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Monthly Production (Breakdown) ({selectedYear})</CardTitle>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Monthly Production (Breakdown) ({selectedYear})</CardTitle>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">Monthly Production Breakdown ({selectedYear})</CardTitle>
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
              {/* Use a combined layout: BarChart for bars and Line overlay via LineChart is not directly composable in Recharts; instead use ComposedChart */}
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
                  formatter={(value, name) => [`${value} L`, name]} 
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="totalMorningProduction" fill="#F59E0B" name="Morning" radius={[4,4,0,0]} />
                <Bar dataKey="totalEveningProduction" fill="#10B981" name="Evening" radius={[4,4,0,0]} />
                <Bar dataKey="totalDailyProduction" fill="#8B5CF6" name="Total (bars)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Provide a separate line chart below to emphasize trend */}
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyProduction}>
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
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} L`, 'Total Production']} 
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="totalDailyProduction" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} name="Total (line)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
