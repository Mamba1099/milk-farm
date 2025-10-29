"use client";

import React, { Suspense } from "react";
import { Icons } from "@/components/icons";
import { ClockLoader } from "react-spinners";
import { DailyProductionChart } from "@/components/analytics/daily-production-chart";
import DailyBalanceChart from "@/components/analytics/daily-balance-chart";
import { SalesRevenueChart } from "@/components/analytics/sales-revenue-chart";
import { MonthlyProductionTotalChart } from "@/components/analytics/monthly-production-total-chart";
import { MonthlyProductionComboChart } from "@/components/analytics/monthly-production-combo-chart";
import { MonthlySalesChart } from "@/components/analytics/monthly-sales-chart";
import { MonthlySalesLineChart } from "@/components/analytics/monthly-sales-line-chart";
import { TreatmentCostTrendsChart } from "@/components/analytics/treatment-cost-trends-chart";
import { TreatmentExpenseChart } from "@/components/analytics/treatment-expense-chart";
import { ServingOutcomeChart } from "@/components/analytics/serving-outcome-chart";
import { ServingTypeChart } from "@/components/analytics/serving-type-chart";

const AnalyticsPageContent = React.memo(() => {
  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
          <Icons.barChart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">Comprehensive farm performance insights and analytics</p>
        </div>
      </div>

      {/* Phase 1 - Essential Charts */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Icons.trendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Essential Metrics</h2>
        </div>
        
        {/* First Row: Daily Production - Full Width */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <DailyProductionChart />
        </div>
        
        {/* Second Row: Daily Revenue - Full Width */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <SalesRevenueChart />
        </div>
        
        {/* Third Row: Daily Balance - Full Width */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <DailyBalanceChart />
        </div>
      </section>

      {/* Phase 2 - Performance Analytics */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Icons.analytics className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Performance Analytics</h2>
        </div>
        
        {/* Monthly Production: total bar + combo (breakdown + trend) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MonthlyProductionTotalChart />
          <MonthlyProductionComboChart />
        </div>

        {/* Monthly Sales: bar + line */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MonthlySalesChart />
          <MonthlySalesLineChart />
        </div>
        
        {/* Treatment Cost Trends - Full Width */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <TreatmentCostTrendsChart />
        </div>
      </section>

      {/* Health & Treatment Analytics */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Icons.heartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Health & Treatment Analytics</h2>
        </div>
        
        {/* Monthly Treatment Expense - Full Width to show all months */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <TreatmentExpenseChart />
        </div>
      </section>

      {/* Breeding & Reproduction Analytics */}
      <section className="space-y-4 sm:space-y-6 rounded-xl p-3 sm:p-6 border border-pink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Icons.heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Breeding & Reproduction Analytics</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <ServingOutcomeChart />
          <ServingTypeChart />
        </div>
      </section>
    </div>
  );
});

AnalyticsPageContent.displayName = 'AnalyticsPageContent';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <ClockLoader color="#059669" size={60} />
      </div>
    }>
      <AnalyticsPageContent />
    </Suspense>
  );
}