"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface DailyProductionData {
  date: string;
  fullDate: string;
  morningProduction: number;
  eveningProduction: number;
  totalProduction: number;
  calfFeedingAM: number;
  calfFeedingPM: number;
}

export function DailyProductionChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "daily-production"],
    queryFn: async () => {
      const response = await apiClient.get("/api/analytics/daily-production");
      return response.data as DailyProductionData[];
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
            <Icons.milk className="h-5 w-5 text-blue-600" />
            Daily Production Trends
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
            <Icons.milk className="h-5 w-5 text-blue-600" />
            Daily Production Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load production data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Icons.milk className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <span className="truncate">Daily Production - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
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
                  label={{ value: 'Liters', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0] && payload[0].payload) {
                      return `Date: ${payload[0].payload.fullDate}`;
                    }
                    return `Day ${label}`;
                  }}
                  formatter={(value) => [`${value} L`, 'Total Production']}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="totalProduction" 
                  fill="#059669" 
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