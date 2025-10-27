"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface TreatmentCostData {
  month: string;
  totalCost: number;
  totalTreatments: number;
  averageCost: number;
  uniqueDiseases: number;
  uniqueMedicines: number;
}

export function TreatmentCostTrendsChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "treatment-cost-trends"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.treatmentCostTrends);
      return response.data as TreatmentCostData[];
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
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Icons.heartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          <span className="truncate">Treatment Cost Trends - {new Date().getFullYear()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Mobile: Horizontal scroll container */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible chart-scroll">
          <div className="min-w-[600px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 'dataMax + 100']} 
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Cost (KES)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalCost' ? `KSh ${Number(value).toLocaleString()}` :
                    name === 'totalTreatments' ? `${value} treatments` :
                    name === 'averageCost' ? `KSh ${Number(value).toFixed(2)}` :
                    `${value}`,
                    name === 'totalCost' ? 'Total Cost' :
                    name === 'totalTreatments' ? 'Treatment Count' :
                    name === 'averageCost' ? 'Average Cost' :
                    name === 'uniqueDiseases' ? 'Unique Diseases' : 'Unique Medicines'
                  ]}
                  contentStyle={{ fontSize: '12px' }}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}