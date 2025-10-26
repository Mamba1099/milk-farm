"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface ProductionCalfFeedingData {
  date: string;
  morningFed: number;
  eveningFed: number;
  totalFed: number;
}

export function ProductionCalfFeedingChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "production-calf-feeding"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.productionCalfFeeding);
      return response.data as ProductionCalfFeedingData[];
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
            <Icons.milk className="h-5 w-5 text-orange-600" />
            Production vs Calf Feeding
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
            <Icons.milk className="h-5 w-5 text-orange-600" />
            Production vs Calf Feeding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load comparison data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.milk className="h-5 w-5 text-orange-600" />
          Production vs Calf Feeding
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
                `${value} L`,
                name === 'morningFed' ? 'Morning Fed' :
                name === 'eveningFed' ? 'Evening Fed' : 'Total Fed'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="morningFed" 
              fill="#3B82F6" 
              name="Morning Fed"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="eveningFed" 
              fill="#F59E0B" 
              name="Evening Fed"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="totalFed" 
              fill="#10B981" 
              name="Total Fed"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}