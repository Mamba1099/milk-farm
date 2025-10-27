"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import type {
  ChartData,
  SimpleBarChartProps,
  SimpleProgressChartProps,
  StatCardProps,
  TrendData,
  SimpleTrendChartProps,
} from "@/lib/types";

export function SimpleBarChart({
  title,
  data,
  icon = "barChart",
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const Icon = Icons[icon];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.value / maxValue) * 100).toFixed(1);

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-600">
                    {item.value} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      item.color || "bg-blue-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SimpleProgressChart({
  title,
  data,
  icon = "analytics",
  showPercentage = true,
}: SimpleProgressChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const Icon = Icons[icon];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage =
              total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-gray-600">
                    {item.value}
                    {showPercentage && ` (${percentage}%)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      item.color || "bg-indigo-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  trend,
}: StatCardProps) {
  const Icon = Icons[icon];

  const colorClasses = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-600",
      textDark: "text-blue-800",
      icon: "text-blue-600",
    },
    green: {
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      text: "text-green-600",
      textDark: "text-green-800",
      icon: "text-green-600",
    },
    orange: {
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-600",
      textDark: "text-orange-800",
      icon: "text-orange-600",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      text: "text-purple-600",
      textDark: "text-purple-800",
      icon: "text-purple-600",
    },
    red: {
      bg: "from-red-50 to-red-100",
      border: "border-red-200",
      text: "text-red-600",
      textDark: "text-red-800",
      icon: "text-red-600",
    },
    indigo: {
      bg: "from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      text: "text-indigo-600",
      textDark: "text-indigo-800",
      icon: "text-indigo-600",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card
      className={`bg-gradient-to-br ${colors.bg} ${colors.border} hover:shadow-lg transition-all duration-300`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={`${colors.text} text-xs sm:text-sm font-medium`}>
              {title}
            </p>
            <p className={`text-xl sm:text-2xl font-bold ${colors.textDark}`}>
              {value}
            </p>
            {subtitle && <p className={`text-xs ${colors.text}`}>{subtitle}</p>}
            {trend && (
              <p
                className={`text-xs flex items-center gap-1 ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${colors.icon}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export function SimpleTrendChart({
  title,
  data,
  icon = "analytics",
  color = "blue",
}: SimpleTrendChartProps) {
  const Icon = Icons[icon];
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple trend visualization */}
          <div className="relative h-32 bg-gray-50 rounded-lg p-4">
            <div className="absolute inset-4 flex items-end justify-between">
              {data.map((point, index) => {
                const height =
                  range > 0 ? ((point.value - minValue) / range) * 80 : 40;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-1"
                    style={{ flex: 1 }}
                  >
                    <div
                      className={`w-2 bg-${color}-500 rounded-t transition-all duration-700`}
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-xs text-gray-600 transform -rotate-45 origin-left">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Min</p>
              <p className="font-semibold">{minValue}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Max</p>
              <p className="font-semibold">{maxValue}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Avg</p>
              <p className="font-semibold">
                {(
                  data.reduce((sum, d) => sum + d.value, 0) / data.length
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
