"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Types for reports
export interface ReportParams {
  type: "production" | "animals" | "treatments" | "overview";
  startDate?: string;
  endDate?: string;
}

export interface ProductionReportData {
  type: "production";
  period: { startDate: string; endDate: string };
  summary: {
    totalQuantity: number;
    averageDaily: number;
    recordCount: number;
  };
  byAnimal: Array<{
    animal: {
      tagNumber: string;
      name: string | null;
      type: string;
    };
    totalQuantity: number;
    recordCount: number;
  }>;
}

export interface AnimalsReportData {
  type: "animals";
  period: { startDate: string; endDate: string };
  summary: {
    totalAnimals: number;
    healthyAnimals: number;
    sickAnimals: number;
    injuredAnimals: number;
    byType: Record<string, number>;
  };
}

export interface TreatmentsReportData {
  type: "treatments";
  period: { startDate: string; endDate: string };
  summary: {
    totalTreatments: number;
    totalCost: number;
    averageCost: number;
    byType: Record<string, number>;
  };
  byAnimal: Array<{
    animal: {
      tagNumber: string;
      name: string | null;
      type: string;
      healthStatus: string;
    };
    treatmentCount: number;
    totalCost: number;
  }>;
}

export interface OverviewReportData {
  type: "overview";
  period: { startDate: string; endDate: string };
  summary: {
    totalAnimals: number;
    totalProduction: number;
    totalProductionRecords: number;
    totalTreatments: number;
    totalTreatmentCost: number;
    averageProductionPerRecord: number;
  };
}

export type ReportData =
  | ProductionReportData
  | AnimalsReportData
  | TreatmentsReportData
  | OverviewReportData;

// Hook to fetch reports
export const useReport = (params: ReportParams) => {
  const queryParams = new URLSearchParams({
    type: params.type,
    ...(params.startDate && { startDate: params.startDate }),
    ...(params.endDate && { endDate: params.endDate }),
  });

  return useQuery<{ report: ReportData }, Error>({
    queryKey: ["reports", params.type, params.startDate, params.endDate],
    queryFn: async () => {
      const response = await apiClient.get(
        `/reports?${queryParams.toString()}`
      );
      return response.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!params.type, // Only fetch if type is provided
  });
};

// Convenience hooks for specific report types
export const useProductionReport = (startDate?: string, endDate?: string) => {
  return useReport({ type: "production", startDate, endDate });
};

export const useAnimalsReport = (startDate?: string, endDate?: string) => {
  return useReport({ type: "animals", startDate, endDate });
};

export const useTreatmentsReport = (startDate?: string, endDate?: string) => {
  return useReport({ type: "treatments", startDate, endDate });
};

export const useOverviewReport = (startDate?: string, endDate?: string) => {
  return useReport({ type: "overview", startDate, endDate });
};
