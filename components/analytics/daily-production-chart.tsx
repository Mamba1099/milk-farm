"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface ProductionData {
  date: string;
  morningProduction: number;
  eveningProduction: number;
  totalProduction: number;
}

export function DailyProductionChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "daily-production"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.dailyProduction);
      return response.data as ProductionData[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        <CardTitle className="flex items-center gap-2">
          <Icons.milk className="h-5 w-5 text-blue-600" />
          Daily Production Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value} L`,
                name === 'morningProduction' ? 'Morning' :
                name === 'eveningProduction' ? 'Evening' : 'Total'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="morningProduction" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Morning Production"
            />
            <Line 
              type="monotone" 
              dataKey="eveningProduction" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Evening Production"
            />
            <Line 
              type="monotone" 
              dataKey="totalProduction" 
              stroke="#6366F1" 
              strokeWidth={3}
              name="Total Production"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}