"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface ServingOutcomeData {
  outcome: string;
  count: number;
  percentage: number;
  [key: string]: any;
}

const OUTCOME_COLORS = {
  SUCCESSFUL: '#10B981',
  FAILED: '#EF4444',
  PENDING: '#F59E0B'
};

export function ServingOutcomeChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "serving-outcomes"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.servingOutcomes);
      return response.data as ServingOutcomeData[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.heart className="h-5 w-5 text-pink-600" />
            Serving Outcome Distribution
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
            <Icons.heart className="h-5 w-5 text-pink-600" />
            Serving Outcome Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-600">
            <Icons.alertCircle className="h-8 w-8 mr-2" />
            Failed to load serving data
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.heart className="h-5 w-5 text-pink-600" />
          Serving Outcome Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={OUTCOME_COLORS[entry.outcome as keyof typeof OUTCOME_COLORS] || '#6B7280'} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} servings (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.outcome
              ]}
            />
            <Legend 
              formatter={(value, entry: any) => {
                const payload = entry?.payload;
                return payload ? `${payload.outcome} (${payload.count})` : value;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {data.map((outcome) => (
            <div 
              key={outcome.outcome} 
              className="text-center p-2 rounded"
              style={{ 
                backgroundColor: `${OUTCOME_COLORS[outcome.outcome as keyof typeof OUTCOME_COLORS]}15`,
                color: OUTCOME_COLORS[outcome.outcome as keyof typeof OUTCOME_COLORS] 
              }}
            >
              <div className="font-semibold">{outcome.outcome}</div>
              <div>{outcome.count} servings</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}