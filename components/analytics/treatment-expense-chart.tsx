"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { ClockLoader } from "react-spinners";

interface TreatmentExpenseData {
  month: string;
  totalExpense: number;
  treatmentCount: number;
  averagePerTreatment: number;
  averagePerAnimal: number;
}

export function TreatmentExpenseChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "treatment-expenses"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.analytics.treatmentExpenses);
      return response.data as TreatmentExpenseData[];
    },
    staleTime: 5 * 60 * 1000,
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
        <CardTitle className="flex items-center gap-2">
          <Icons.dollarSign className="h-5 w-5 text-red-600" />
          Monthly Treatment Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'totalExpense' ? `KSh ${value.toLocaleString()}` :
                name === 'treatmentCount' ? `${value} treatments` :
                name === 'averagePerTreatment' ? `KSh ${value.toLocaleString()}` :
                `KSh ${value.toLocaleString()}`,
                name === 'totalExpense' ? 'Total Expense' :
                name === 'treatmentCount' ? 'Treatment Count' :
                name === 'averagePerTreatment' ? 'Avg per Treatment' : 'Avg per Animal'
              ]}
            />
            <Bar 
              dataKey="totalExpense" 
              fill="#EF4444" 
              name="Total Expense"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">Total Treatments</div>
            <div className="text-red-600">
              {data.reduce((sum, item) => sum + item.treatmentCount, 0)}
            </div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">Total Cost</div>
            <div className="text-red-600">
              KSh {data.reduce((sum, item) => sum + item.totalExpense, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}