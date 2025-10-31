import React from "react";
import { Card } from "@/components/ui/card";
import { Activity, Clock, TrendingUp, TrendingDown, Heart, Calendar } from "lucide-react";
import type { ServingStats } from "@/lib/types/serving";

interface ServingStatisticsCardProps {
  stats: ServingStats;
}

export const ServingStatisticsCard: React.FC<ServingStatisticsCardProps> = ({ stats }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 w-full">
    <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-sky-200 to-sky-400 w-full">
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-gray-800 text-xs sm:text-sm mb-3">Total Servings</p>
          <p className="text-3xl font-bold text-sky-900 mb-2">{stats.total}</p>
        </div>
        <div className="p-3 bg-sky-700 rounded-full shadow">
          <Activity className="h-6 w-6 text-sky-100" />
        </div>
      </div>
    </Card>
    <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-yellow-200 to-yellow-400 w-full">
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-gray-800 text-xs sm:text-sm mb-3">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 mb-2">{stats.pending}</p>
        </div>
        <div className="p-3 bg-yellow-700 rounded-full shadow">
          <Clock className="h-6 w-6 text-yellow-100" />
        </div>
      </div>
    </Card>
    <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-green-200 to-green-400 w-full">
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-gray-800 text-xs sm:text-sm mb-3">Successful</p>
          <p className="text-3xl font-bold text-green-900 mb-2">{stats.successful}</p>
        </div>
        <div className="p-3 bg-green-700 rounded-full shadow">
          <TrendingUp className="h-6 w-6 text-green-100" />
        </div>
      </div>
    </Card>
    <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-red-200 to-red-400 w-full">
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-gray-800 text-xs sm:text-sm mb-3">Failed</p>
          <p className="text-3xl font-bold text-red-900 mb-2">{stats.failed}</p>
        </div>
        <div className="p-3 bg-red-700 rounded-full shadow">
          <TrendingDown className="h-6 w-6 text-red-100" />
        </div>
      </div>
    </Card>
    <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-purple-200 to-purple-400 w-full">
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-gray-800 text-xs sm:text-sm mb-3">Predetermined</p>
          <p className="text-3xl font-bold text-purple-900 mb-2">{stats.predetermined}</p>
        </div>
        <div className="p-3 bg-purple-700 rounded-full shadow">
          <Heart className="h-6 w-6 text-purple-100" />
        </div>
      </div>
    </Card>
    <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-indigo-200 to-indigo-400 w-full">
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-gray-800 text-xs sm:text-sm mb-3">Normal Ova</p>
          <p className="text-3xl font-bold text-indigo-900 mb-2">{stats.normalOva}</p>
        </div>
        <div className="p-3 bg-indigo-700 rounded-full shadow">
          <Calendar className="h-6 w-6 text-indigo-100" />
        </div>
      </div>
    </Card>
  </div>
);
