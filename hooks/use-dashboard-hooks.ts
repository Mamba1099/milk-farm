"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Animal,
  Production,
  Treatment,
  UserStats,
  SystemHealth,
  DashboardStats,
} from "@/lib/types";

export const useAnimalStats = () => {
  const { toast } = useToast();

  return useQuery<DashboardStats["animals"], Error>({
    queryKey: ["dashboard", "animals"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/animals?limit=1000");
        const animals: Animal[] = response.data.animals || [];

        if (animals.length === 0) {
          return {
            total: 0,
            cows: 0,
            bulls: 0,
            calves: 0,
            healthy: 0,
            sick: 0,
            injured: 0,
            matured: 0,
          };
        }

        return {
          total: animals.length,
          cows: animals.filter((a) => a.type === "COW").length,
          bulls: animals.filter((a) => a.type === "BULL").length,
          calves: animals.filter((a) => a.type === "CALF").length,
          healthy: animals.filter((a) => a.healthStatus === "HEALTHY").length,
          sick: animals.filter((a) => a.healthStatus === "SICK").length,
          injured: animals.filter((a) => a.healthStatus === "INJURED").length,
          matured: animals.filter((a) => a.isMatured === true).length,
        };
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch animal statistics",
          type: "error",
        });
        throw new Error("Failed to fetch animal statistics");
      }
    },
    retry: 2,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useProductionStats = () => {
  const { toast } = useToast();

  return useQuery<DashboardStats["production"], Error>({
    queryKey: ["dashboard", "production"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/production?limit=1000");
        const productions: Production[] = response.data.productions || [];

        if (productions.length === 0) {
          return {
            totalRecords: 0,
            todayQuantity: 0,
            weeklyTotal: 0,
            weeklyAverage: 0,
            monthlyTotal: 0,
            totalQuantity: 0,
            averageDaily: 0,
            averagePerAnimal: 0,
            lastRecordDate: null,
          };
        }

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const todayProductions = productions.filter((p) =>
          p.date.startsWith(today)
        );

        const weeklyProductions = productions.filter(
          (p) => new Date(p.date) >= weekAgo
        );

        const monthlyProductions = productions.filter(
          (p) => new Date(p.date) >= monthAgo
        );

        const todayQuantity = todayProductions.reduce(
          (sum, p) => sum + (p.totalQuantity || 0),
          0
        );
        const weeklyTotal = weeklyProductions.reduce(
          (sum, p) => sum + (p.totalQuantity || 0),
          0
        );
        const monthlyTotal = monthlyProductions.reduce(
          (sum, p) => sum + (p.totalQuantity || 0),
          0
        );
        const weeklyAverage = Math.round(weeklyTotal / 7);

        const sortedProductions = [...productions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastRecordDate =
          sortedProductions.length > 0 ? sortedProductions[0].date : null;

        return {
          totalRecords: productions.length,
          todayQuantity,
          weeklyTotal,
          weeklyAverage,
          monthlyTotal,
          totalQuantity: monthlyTotal,
          averageDaily: weeklyAverage,
          averagePerAnimal:
            productions.length > 0
              ? monthlyTotal /
                Math.max(1, new Set(productions.map((p) => p.animalId)).size)
              : 0,
          lastRecordDate,
        };
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch production statistics",
          type: "error",
        });
        throw new Error("Failed to fetch production statistics");
      }
    },
    retry: 2,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useTreatmentStats = () => {
  const { toast } = useToast();

  return useQuery<DashboardStats["treatments"], Error>({
    queryKey: ["dashboard", "treatments"],
    queryFn: async () => {
      try {
        const endDate = new Date().toISOString();
        const startDate = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();

        const response = await apiClient.get(
          `/reports?type=treatments&startDate=${startDate}&endDate=${endDate}`
        );
        const treatmentsReport = response.data.report;

        if (!treatmentsReport || !treatmentsReport.details) {
          return {
            totalRecords: 0,
            thisMonth: 0,
            pendingFollowups: 0,
            lastTreatmentDate: null,
            totalCost: 0,
          };
        }

        const treatments: Treatment[] = treatmentsReport.details;
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisMonthTreatments = treatments.filter(
          (t: Treatment) => new Date(t.treatedAt) >= monthAgo
        );

        const totalCost = treatments.reduce(
          (sum: number, t: Treatment) => sum + (t.cost || 0),
          0
        );

        const pendingFollowups = Math.floor(thisMonthTreatments.length * 0.1);

        const sortedTreatments = [...treatments].sort(
          (a: Treatment, b: Treatment) =>
            new Date(b.treatedAt).getTime() - new Date(a.treatedAt).getTime()
        );
        const lastTreatmentDate =
          sortedTreatments.length > 0 ? sortedTreatments[0].treatedAt : null;

        return {
          totalRecords: treatments.length,
          thisMonth: thisMonthTreatments.length,
          pendingFollowups,
          lastTreatmentDate,
          totalCost,
        };
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch treatment statistics",
          type: "error",
        });
        return {
          totalRecords: 0,
          thisMonth: 0,
          pendingFollowups: 0,
          lastTreatmentDate: null,
          totalCost: 0,
        };
      }
    },
    retry: 2,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUserStats = () => {
  const { toast } = useToast();

  return useQuery<UserStats, Error>({
    queryKey: ["dashboard", "users"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/users?stats=true");
        return response.data.stats;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user statistics",
          type: "error",
        });
        return {
          totalUsers: 1,
          activeUsers: 1,
          farmManagers: 1,
          employees: 0,
        };
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSystemHealth = () => {
  const { toast } = useToast();

  return useQuery<SystemHealth, Error>({
    queryKey: ["dashboard", "systemHealth"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/system/health");
        return response.data.health;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch system health",
          type: "error",
        });
        return {
          environment: process.env.NODE_ENV || "development",
          database: {
            status: "Unknown",
            error: "Failed to check database status",
          },
          fileStorage: {
            status: "Unknown",
          },
          authSystem: {
            status: "Unknown",
          },
          api: {
            status: "Unknown",
          },
          lastBackup: null,
          timestamp: new Date().toISOString(),
        };
      }
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useDashboardStats = () => {
  const animalStats = useAnimalStats();
  const productionStats = useProductionStats();
  const treatmentStats = useTreatmentStats();
  const userStats = useUserStats();
  const systemHealth = useSystemHealth();

  return {
    animals: animalStats,
    production: productionStats,
    treatments: treatmentStats,
    users: userStats,
    systemHealth: systemHealth,
    isLoading:
      animalStats.isLoading ||
      productionStats.isLoading ||
      treatmentStats.isLoading ||
      userStats.isLoading ||
      systemHealth.isLoading,
    isError:
      animalStats.isError ||
      productionStats.isError ||
      treatmentStats.isError ||
      userStats.isError ||
      systemHealth.isError,
    error:
      animalStats.error ||
      productionStats.error ||
      treatmentStats.error ||
      userStats.error ||
      systemHealth.error,
  };
};
export type { Animal };

