"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface TreatmentCostData {
  date: string;
  totalCost: number;
  treatmentCount: number;
  averageCost: number;
}

export function TreatmentCostTrendsChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "treatment-cost-trends"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.treatmentCostTrends);
      return response.data as TreatmentCostData[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.heartPulse className="h-5 w-5 text-red-600" />
            Treatment Cost Trends
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
            <Icons.heartPulse className="h-5 w-5 text-red-600" />
            Treatment Cost Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load treatment data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.heartPulse className="h-5 w-5 text-red-600" />
          Treatment Cost Trends
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
                name === 'totalCost' ? `KSh ${value.toLocaleString()}` :
                name === 'treatmentCount' ? `${value} treatments` :
                `KSh ${value.toLocaleString()}`,
                name === 'totalCost' ? 'Total Cost' :
                name === 'treatmentCount' ? 'Treatment Count' : 'Average Cost'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="totalCost" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Total Cost"
            />
            <Line 
              type="monotone" 
              dataKey="averageCost" 
              stroke="#F59E0B" 
              strokeWidth={2}
              name="Average Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}