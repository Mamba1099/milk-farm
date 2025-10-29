"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface TreatmentExpenseData {
  month: string;
  totalCost: number;
  treatmentCount: number;
  avgCost: number;
}

export function TreatmentExpenseChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "treatment-expense", selectedYear],
    queryFn: async () => {
      const response = await apiClient.get(`/api/analytics/treatment-expense?year=${selectedYear}`);
      return response.data as TreatmentExpenseData[];
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
            <Icons.dollarSign className="h-5 w-5 text-red-600" />
            Monthly Treatment Expenses
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
            <Icons.dollarSign className="h-5 w-5 text-red-600" />
            Monthly Treatment Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load expense data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Icons.dollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            <span className="truncate">Monthly Treatment Expenses ({selectedYear})</span>
          </CardTitle>
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
          <div className="min-w-[500px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Cost (KES)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalCost' ? `KSh ${value.toLocaleString()}` :
                    name === 'treatmentCount' ? `${value} treatments` :
                    name === 'avgCost' ? `KSh ${value.toLocaleString()}` :
                    `KSh ${value.toLocaleString()}`,
                    name === 'totalCost' ? 'Total Cost' :
                    name === 'treatmentCount' ? 'Treatment Count' :
                    name === 'avgCost' ? 'Average Cost' : 'Average Cost'
                  ]}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="totalCost" 
                  fill="#EF4444" 
                  name="Total Cost"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Summary Stats - Better mobile layout */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">Total Treatments</div>
            <div className="text-red-600">
              {data.reduce((sum, item) => sum + item.treatmentCount, 0)}
            </div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">Total Cost</div>
            <div className="text-red-600">
              KSh {data.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}