"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface ServingTypeData {
  servingType: string;
  total: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: number;
}

export function ServingTypeChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "serving-types"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.servingTypes);
      return response.data as ServingTypeData[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.cow className="h-5 w-5 text-blue-600" />
            Serving Types Distribution
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
            <Icons.cow className="h-5 w-5 text-blue-600" />
            Serving Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load serving type data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.cow className="h-5 w-5 text-blue-600" />
          Serving Types Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="servingType" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value}`,
                name === 'successful' ? 'Successful' :
                name === 'failed' ? 'Failed' :
                name === 'pending' ? 'Pending' : 'Total'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="total" 
              fill="#6366F1" 
              name="Total Servings"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="successful" 
              fill="#10B981" 
              name="Successful"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Success Rate Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {data.map((type) => (
            <div key={type.servingType} className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-700">{type.servingType}</div>
              <div className="text-blue-600">{type.successRate.toFixed(1)}% Success Rate</div>
              <div className="text-xs text-gray-600">{type.total} total servings</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}