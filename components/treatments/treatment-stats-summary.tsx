"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TreatmentStatsSummaryProps } from "@/lib/types/animal";

export const TreatmentStatsSummary: React.FC<TreatmentStatsSummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Total Treatments */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white flex flex-col justify-between h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Total Treatments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-end h-full">
          <div className="mt-auto text-4xl font-extrabold tracking-tight drop-shadow text-white">{summary.totalTreatments}</div>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white flex flex-col justify-between h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Total Treatment Cost
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-end h-full">
          <div className="mt-auto text-4xl font-extrabold tracking-tight drop-shadow text-white">{formatCurrency(summary.totalCost)}</div>
        </CardContent>
      </Card>

      {/* Average Cost */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white flex flex-col justify-between h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Average Cost per Treatment
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-end h-full">
          <div className="mt-auto text-4xl font-extrabold tracking-tight drop-shadow text-white">{formatCurrency(summary.averageCostPerTreatment)}</div>
        </CardContent>
      </Card>

      {/* Most Common Disease */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white flex flex-col justify-between h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Most Common Disease
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-end h-full">
          {summary.mostCommonDisease ? (
            <>
              <div className="text-lg font-bold mb-1 text-white">
                {summary.mostCommonDisease.disease}
              </div>
              <Badge variant="secondary" className="text-xs">
                {summary.mostCommonDisease.count} treatments
              </Badge>
            </>
          ) : (
            <div className="text-lg font-bold text-white">No data</div>
          )}
        </CardContent>
      </Card>

      {/* Most Expensive Disease */}
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white flex flex-col justify-between h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingDown className="h-4 w-4 mr-2" />
            Most Expensive Disease
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-end h-full">
          {summary.mostExpensiveDisease ? (
            <>
              <div className="text-lg font-bold mb-1 text-white">
                {summary.mostExpensiveDisease.disease}
              </div>
              <Badge variant="secondary" className="text-xs">
                {formatCurrency(summary.mostExpensiveDisease.totalCost)}
              </Badge>
            </>
          ) : (
            <div className="text-lg font-bold text-white">No data</div>
          )}
        </CardContent>
      </Card>

      {/* Health Impact Indicator */}
      <Card className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white flex flex-col justify-between h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Health Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-end h-full">
          <div className="mt-auto text-2xl font-extrabold tracking-tight drop-shadow text-white">
            {summary.totalTreatments > 0 ? "Active Monitoring" : "Excellent"}
          </div>
          <div className="text-xs text-white mt-1">
            {summary.totalTreatments === 0 
              ? "No treatments needed"
              : `${summary.totalTreatments} treatments recorded`
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
