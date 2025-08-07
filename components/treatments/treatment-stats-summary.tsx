"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TreatmentStatsSummaryProps {
  summary: {
    totalTreatments: number;
    totalCost: number;
    averageCostPerTreatment: number;
    mostCommonDisease: {
      disease: string;
      count: number;
    } | null;
    mostExpensiveDisease: {
      disease: string;
      totalCost: number;
    } | null;
  };
}

export const TreatmentStatsSummary: React.FC<TreatmentStatsSummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Treatments */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Total Treatments</p>
            <p className="text-2xl font-bold text-blue-800">{summary.totalTreatments}</p>
          </div>
          <Activity className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      {/* Total Cost */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Total Treatment Cost</p>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(summary.totalCost)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      {/* Average Cost */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600">Average Cost per Treatment</p>
            <p className="text-2xl font-bold text-purple-800">
              {formatCurrency(summary.averageCostPerTreatment)}
            </p>
          </div>
          <Target className="h-8 w-8 text-purple-600" />
        </div>
      </Card>

      {/* Most Common Disease */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Most Common Disease</p>
            {summary.mostCommonDisease ? (
              <>
                <p className="text-lg font-bold text-orange-800 mb-1">
                  {summary.mostCommonDisease.disease}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {summary.mostCommonDisease.count} treatments
                </Badge>
              </>
            ) : (
              <p className="text-lg font-bold text-orange-800">No data</p>
            )}
          </div>
          <TrendingUp className="h-8 w-8 text-orange-600" />
        </div>
      </Card>

      {/* Most Expensive Disease */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Most Expensive Disease</p>
            {summary.mostExpensiveDisease ? (
              <>
                <p className="text-lg font-bold text-red-800 mb-1">
                  {summary.mostExpensiveDisease.disease}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(summary.mostExpensiveDisease.totalCost)}
                </Badge>
              </>
            ) : (
              <p className="text-lg font-bold text-red-800">No data</p>
            )}
          </div>
          <TrendingDown className="h-8 w-8 text-red-600" />
        </div>
      </Card>

      {/* Health Impact Indicator */}
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-600">Health Impact</p>
            <p className="text-lg font-bold text-cyan-800">
              {summary.totalTreatments > 0 ? "Active Monitoring" : "Excellent"}
            </p>
            <p className="text-xs text-cyan-600 mt-1">
              {summary.totalTreatments === 0 
                ? "No treatments needed"
                : `${summary.totalTreatments} treatments recorded`
              }
            </p>
          </div>
          <Zap className="h-8 w-8 text-cyan-600" />
        </div>
      </Card>
    </div>
  );
};
