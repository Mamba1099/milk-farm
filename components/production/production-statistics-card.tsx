import React from "react";
import { Card } from "@/components/ui/card";
import { Milk, Calendar, TrendingUp, Eye } from "lucide-react";
import type { ProductionStats } from "@/lib/types/production";

export interface ProductionStatisticsCardProps {
  stats: ProductionStats;
}

export const ProductionStatisticsCard: React.FC<ProductionStatisticsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-green-200 to-green-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Today's Production</p>
            <p className="text-3xl font-bold text-green-900 mb-2">{stats.todayProduction}L</p>
          </div>
          <div className="p-3 bg-green-700 rounded-full shadow">
            <Milk className="h-6 w-6 text-green-100" />
          </div>
        </div>
      </Card>
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-blue-200 to-blue-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Weekly Production</p>
            <p className="text-3xl font-bold text-blue-900 mb-2">{stats.weekProduction}L</p>
          </div>
          <div className="p-3 bg-blue-700 rounded-full shadow">
            <Calendar className="h-6 w-6 text-blue-100" />
          </div>
        </div>
      </Card>
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-orange-200 to-orange-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Monthly Production</p>
            <p className="text-3xl font-bold text-orange-900 mb-2">{stats.monthProduction}L</p>
          </div>
          <div className="p-3 bg-orange-700 rounded-full shadow">
            <TrendingUp className="h-6 w-6 text-orange-100" />
          </div>
        </div>
      </Card>
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-purple-200 to-purple-400">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Active Animals</p>
            <p className="text-3xl font-bold text-purple-900 mb-2">{stats.activeAnimals}</p>
          </div>
          <div className="p-3 bg-purple-700 rounded-full shadow">
            <Eye className="h-6 w-6 text-purple-100" />
          </div>
        </div>
      </Card>
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-blue-300 to-blue-600">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Morning Production</p>
            <p className="text-3xl font-bold text-blue-900 mb-2">{stats.morningTotal}L</p>
          </div>
          <div className="p-3 bg-blue-900 rounded-full shadow">
            <TrendingUp className="h-6 w-6 text-blue-100" />
          </div>
        </div>
      </Card>
      <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-indigo-300 to-indigo-600">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-gray-800 text-xs sm:text-sm mb-3">Evening Production</p>
            <p className="text-3xl font-bold text-indigo-900 mb-2">{stats.eveningTotal}L</p>
          </div>
          <div className="p-3 bg-indigo-900 rounded-full shadow">
            <TrendingUp className="h-6 w-6 text-indigo-100" />
          </div>
        </div>
      </Card>
    </div>
  );
};
