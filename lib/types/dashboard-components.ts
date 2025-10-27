import { Icons } from "@/components/icons";

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface SimpleBarChartProps {
  title: string;
  data: ChartData[];
  icon?: keyof typeof Icons;
  maxHeight?: number;
}

export interface SimpleProgressChartProps {
  title: string;
  data: ChartData[];
  icon?: keyof typeof Icons;
  showPercentage?: boolean;
}

export interface TrendData {
  label: string;
  value: number;
}

export interface SimpleTrendChartProps {
  title: string;
  data: TrendData[];
  icon?: keyof typeof Icons;
  color?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Icons;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "indigo";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface DashboardStatCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}

export interface LoadingCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
}

export interface ErrorCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  error: string;
}

export interface NoDataCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  message: string;
}
