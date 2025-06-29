"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Types for dashboard data
export interface Animal {
  id: string;
  tagNumber: string;
  name?: string;
  type: "COW" | "BULL" | "CALF";
  gender: "MALE" | "FEMALE";
  healthStatus: "HEALTHY" | "SICK" | "INJURED";
  isMatured: boolean;
  birthDate: string;
  createdAt: string;
}

export interface Production {
  id: string;
  date: string;
  quantity: number;
  animalId: string;
  userId: string;
  notes?: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  animalId: string;
  treatmentType: string;
  description: string;
  dateAdministered: string;
  veterinarian?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  farmManagers: number;
  employees: number;
}

export interface DashboardStats {
  animals: {
    total: number;
    cows: number;
    bulls: number;
    calves: number;
    healthy: number;
    sick: number;
    injured: number;
    matured: number;
  };
  production: {
    totalRecords: number;
    todayQuantity: number;
    weeklyTotal: number;
    weeklyAverage: number;
    monthlyTotal: number;
    lastRecordDate: string | null;
  };
  treatments: {
    totalRecords: number;
    thisMonth: number;
    pendingFollowups: number;
    lastTreatmentDate: string | null;
  };
  users: UserStats;
}

// Hook to fetch animal statistics
export const useAnimalStats = () => {
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
        console.error("Error fetching animal stats:", error);
        throw new Error("Failed to fetch animal statistics");
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch production statistics
export const useProductionStats = () => {
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
            lastRecordDate: null,
          };
        }

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Filter productions by date ranges
        const todayProductions = productions.filter((p) =>
          p.date.startsWith(today)
        );

        const weeklyProductions = productions.filter(
          (p) => new Date(p.date) >= weekAgo
        );

        const monthlyProductions = productions.filter(
          (p) => new Date(p.date) >= monthAgo
        );

        // Calculate totals
        const todayQuantity = todayProductions.reduce(
          (sum, p) => sum + p.quantity,
          0
        );
        const weeklyTotal = weeklyProductions.reduce(
          (sum, p) => sum + p.quantity,
          0
        );
        const monthlyTotal = monthlyProductions.reduce(
          (sum, p) => sum + p.quantity,
          0
        );
        const weeklyAverage = Math.round(weeklyTotal / 7);

        // Get most recent production date
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
          lastRecordDate,
        };
      } catch (error) {
        console.error("Error fetching production stats:", error);
        throw new Error("Failed to fetch production statistics");
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch treatment statistics
export const useTreatmentStats = () => {
  return useQuery<DashboardStats["treatments"], Error>({
    queryKey: ["dashboard", "treatments"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/treatments?limit=1000");
        const treatments: Treatment[] = response.data.treatments || [];

        if (treatments.length === 0) {
          return {
            totalRecords: 0,
            thisMonth: 0,
            pendingFollowups: 0,
            lastTreatmentDate: null,
          };
        }

        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Filter treatments by date ranges
        const thisMonthTreatments = treatments.filter(
          (t) => new Date(t.dateAdministered) >= monthAgo
        );

        // For pending followups, we'll estimate based on treatments in last 30 days
        // that might need follow-up (this is a simple estimation)
        const pendingFollowups = Math.floor(thisMonthTreatments.length * 0.1); // 10% estimation

        // Get most recent treatment date
        const sortedTreatments = [...treatments].sort(
          (a, b) =>
            new Date(b.dateAdministered).getTime() -
            new Date(a.dateAdministered).getTime()
        );
        const lastTreatmentDate =
          sortedTreatments.length > 0
            ? sortedTreatments[0].dateAdministered
            : null;

        return {
          totalRecords: treatments.length,
          thisMonth: thisMonthTreatments.length,
          pendingFollowups,
          lastTreatmentDate,
        };
      } catch (error) {
        console.error("Error fetching treatment stats:", error);
        throw new Error("Failed to fetch treatment statistics");
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch user statistics
export const useUserStats = () => {
  return useQuery<UserStats, Error>({
    queryKey: ["dashboard", "users"],
    queryFn: async () => {
      try {
        // Since there's no users API endpoint yet, we'll provide placeholder data
        // This can be replaced with actual API call when users endpoint is available
        return {
          totalUsers: 1, // At least the current user exists
          activeUsers: 1,
          farmManagers: 1,
          employees: 0,
        };
      } catch (error) {
        console.error("Error fetching user stats:", error);
        throw new Error("Failed to fetch user statistics");
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Combined hook for all dashboard data
export const useDashboardStats = () => {
  const animalStats = useAnimalStats();
  const productionStats = useProductionStats();
  const treatmentStats = useTreatmentStats();
  const userStats = useUserStats();

  return {
    animals: animalStats,
    production: productionStats,
    treatments: treatmentStats,
    users: userStats,
    isLoading:
      animalStats.isLoading ||
      productionStats.isLoading ||
      treatmentStats.isLoading ||
      userStats.isLoading,
    isError:
      animalStats.isError ||
      productionStats.isError ||
      treatmentStats.isError ||
      userStats.isError,
    error:
      animalStats.error ||
      productionStats.error ||
      treatmentStats.error ||
      userStats.error,
  };
};
