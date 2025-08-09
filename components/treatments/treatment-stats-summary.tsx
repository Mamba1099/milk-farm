"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TreatmentStatsSummaryProps } from "@/lib/types/animal";

export const TreatmentStatsSummary: React.FC<TreatmentStatsSummaryProps> = ({ summary }) => {
  return (
    <div className="flex flex-row flex-wrap gap-4 mb-8">
      {/* Total Treatments */}
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-cyan-200 to-cyan-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Total Treatments</p>
            <p className="text-3xl font-bold text-cyan-900 mb-2">{summary.totalTreatments}</p>
          </div>
          <div className="p-3 bg-cyan-700 rounded-full shadow">
            <Activity className="h-6 w-6 text-cyan-100" />
          </div>
        </div>
      </Card>
      {/* Total Cost */}
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-teal-200 to-teal-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Total Treatment Cost</p>
            <p className="text-2xl font-bold text-teal-900 mb-2">{formatCurrency(summary.totalCost)}</p>
          </div>
          <div className="p-3 bg-teal-700 rounded-full shadow">
            <DollarSign className="h-6 w-6 text-teal-100" />
          </div>
        </div>
      </Card>
      {/* Average Cost */}
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-purple-200 to-purple-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Average Cost per Treatment</p>
            <p className="text-2xl font-bold text-purple-900 mb-2">{formatCurrency(summary.averageCostPerTreatment)}</p>
          </div>
          <div className="p-3 bg-purple-700 rounded-full shadow">
            <Target className="h-6 w-6 text-purple-100" />
          </div>
        </div>
      </Card>
      {/* Most Common Disease */}
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-orange-200 to-orange-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Most Common Disease</p>
            <p className="text-lg font-bold mb-1 text-orange-900">{summary.mostCommonDisease ? summary.mostCommonDisease.disease : "No data"}</p>
            {summary.mostCommonDisease && (
              <Badge variant="secondary" className="text-xs bg-orange-300 text-orange-900">
                {summary.mostCommonDisease.count} treatments
              </Badge>
            )}
          </div>
          <div className="p-3 bg-orange-700 rounded-full shadow">
            <TrendingUp className="h-6 w-6 text-orange-100" />
          </div>
        </div>
      </Card>
      {/* Most Expensive Disease */}
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-red-200 to-red-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Most Expensive Disease</p>
            <p className="text-lg font-bold mb-1 text-red-900">{summary.mostExpensiveDisease ? summary.mostExpensiveDisease.disease : "No data"}</p>
            {summary.mostExpensiveDisease && (
              <Badge variant="secondary" className="text-xs bg-red-300 text-red-900">
                {formatCurrency(summary.mostExpensiveDisease.totalCost)}
              </Badge>
            )}
          </div>
          <div className="p-3 bg-red-700 rounded-full shadow">
            <TrendingDown className="h-6 w-6 text-red-100" />
          </div>
        </div>
      </Card>
      {/* Health Impact Indicator */}
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-yellow-200 to-yellow-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Health Impact</p>
            <p className="text-xl font-extrabold tracking-tight drop-shadow text-yellow-900 mb-2">{summary.totalTreatments > 0 ? "Active Monitoring" : "Excellent"}</p>
            <div className="text-xs text-yellow-900 mt-1">{summary.totalTreatments === 0 ? "No treatments needed" : `${summary.totalTreatments} treatments recorded`}</div>
          </div>
          <div className="p-3 bg-yellow-700 rounded-full shadow">
            <Zap className="h-6 w-6 text-yellow-100" />
          </div>
        </div>
      </Card>
    </div>
  );
};
