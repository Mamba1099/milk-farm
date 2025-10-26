"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface ServingTypeData {
  type: string;
  count: number;
  successfulCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;
  percentage: number;
  predeterminedCount: number;
  normalCount: number;
}

export function ServingTypeChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "serving-types"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.servingTypes);
      return response.data as ServingTypeData[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
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
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <span className="truncate">Serving Types Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Mobile: Horizontal scroll container */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible chart-scroll">
          <div className="min-w-[400px] lg:min-w-full">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="type" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}`,
                    name === 'successfulCount' ? 'Successful' :
                    name === 'failedCount' ? 'Failed' :
                    name === 'pendingCount' ? 'Pending' : 'Total'
                  ]}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar 
                  dataKey="count" 
                  fill="#6366F1" 
                  name="Total Servings"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="successfulCount" 
                  fill="#10B981" 
                  name="Successful"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Success Rate Summary - Better mobile layout */}
        <div className="mt-4 space-y-4">
          {/* Type Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {data.map((type) => (
              <div key={type.type} className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-700 text-base sm:text-lg">{type.type}</div>
                <div className="text-blue-600 font-medium">{type.successRate.toFixed(1)}% Success Rate</div>
                <div className="text-xs text-gray-600 mt-1">
                  {type.count} total ({type.percentage.toFixed(1)}%)
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ✓ {type.successfulCount} | ✗ {type.failedCount} | ⏳ {type.pendingCount}
                </div>
              </div>
            ))}
          </div>

          {/* Ova Type Distribution */}
          {data.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ova Type Distribution</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {data.map((type) => (
                  <div key={`ova-${type.type}`} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{type.type}</div>
                    <div className="text-gray-600">
                      Predetermined: {type.predeterminedCount} | Normal: {type.normalCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}