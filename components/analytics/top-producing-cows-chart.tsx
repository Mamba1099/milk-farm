"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface TopProducerData {
  name: string;
  tagNumber: string;
  totalProduction: number;
  averageDaily: number;
}

export function TopProducingCowsChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "top-producing-cows"],
    queryFn: async () => {
      const response = await apiClient.get("/api/analytics/top-producing-cows");
      return response.data as TopProducerData[];
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
            <Icons.crown className="h-5 w-5 text-yellow-600" />
            Top Producing Cows
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
            <Icons.crown className="h-5 w-5 text-yellow-600" />
            Top Producing Cows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load producer data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(cow => ({
    ...cow,
    displayName: cow.name || `Tag ${cow.tagNumber}`
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.crown className="h-5 w-5 text-yellow-600" />
          Top Producing Cows
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="displayName" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value, name) => [
                `${value} L`,
                name === 'totalProduction' ? 'Total Production' : 'Average Daily'
              ]}
              labelFormatter={(label) => `Cow: ${label}`}
            />
            <Bar 
              dataKey="totalProduction" 
              fill="#8B5CF6" 
              name="Total Production"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}