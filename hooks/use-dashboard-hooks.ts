"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  Animal,
  Production,
  Treatment,
  UserStats,
  SystemHealth,
  DashboardStats,
} from "@/lib/types";
import { ProductionRecord } from "@/lib/types/production";
import { isSameDay } from "date-fns";

export const useAnimalStats = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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
      } catch (error: any) {
        // If it's an authentication error, return empty stats instead of throwing
        if (error.response?.status === 401) {
          console.warn("Authentication required for animal stats - returning empty data");
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
        
        toast({
          title: "Error",
          description: "Failed to fetch animal statistics",
          type: "error",
        });
        throw new Error("Failed to fetch animal statistics");
      }
    },
    enabled: isAuthenticated && !authLoading,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    placeholderData: {
      total: 0,
      cows: 0,
      bulls: 0,
      calves: 0,
      healthy: 0,
      sick: 0,
      injured: 0,
      matured: 0,
    },
  });
};

export const useProductionStats = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery<DashboardStats["production"], Error>({
    queryKey: ["dashboard", "production"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/production?limit=1000");
        const { records = [] } = response.data;

        // Filter out calf records for production stats
        const allProductions = (records as ProductionRecord[]).filter((p: ProductionRecord) => p.animal.type !== "CALF");

        if (allProductions.length === 0) {
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

        const todayProductions = allProductions.filter((p: ProductionRecord) =>
          isSameDay(new Date(p.date), now)
        );
        const weeklyProductions = allProductions.filter(
          (p: ProductionRecord) => new Date(p.date) >= weekAgo
        );
        const monthlyProductions = allProductions.filter(
          (p: ProductionRecord) => new Date(p.date) >= monthAgo
        );

        // Calculate quantities from morning and evening productions
        const todayQuantity = todayProductions.reduce(
          (sum: number, p: ProductionRecord) => sum + ((p.quantity_am || 0) + (p.quantity_pm || 0)),
          0
        );
        const weeklyTotal = weeklyProductions.reduce(
          (sum: number, p: ProductionRecord) => sum + ((p.quantity_am || 0) + (p.quantity_pm || 0)),
          0
        );
        const monthlyTotal = monthlyProductions.reduce(
          (sum: number, p: ProductionRecord) => sum + ((p.quantity_am || 0) + (p.quantity_pm || 0)),
          0
        );
        const weeklyAverage = Math.round(weeklyTotal / 7);

        const sortedProductions = [...allProductions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastRecordDate =
          sortedProductions.length > 0 ? sortedProductions[0].date : null;

        const totalQuantity = allProductions.reduce(
          (sum: number, p: ProductionRecord) => sum + ((p.quantity_am || 0) + (p.quantity_pm || 0)),
          0
        );

        return {
          totalRecords: allProductions.length,
          todayQuantity,
          weeklyTotal,
          weeklyAverage,
          monthlyTotal,
          totalQuantity,
          averageDaily: weeklyAverage,
          averagePerAnimal:
            allProductions.length > 0
              ? totalQuantity /
                Math.max(1, new Set(allProductions.map((p: any) => p.animalId)).size)
              : 0,
          lastRecordDate,
        };
      } catch (error: any) {
        // If it's an authentication error, return empty stats instead of throwing
        if (error.response?.status === 401) {
          console.warn("Authentication required for production stats - returning empty data");
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
        
        toast({
          title: "Error",
          description: "Failed to fetch production statistics",
          type: "error",
        });
        throw new Error("Failed to fetch production statistics");
      }
    },
    enabled: isAuthenticated && !authLoading,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    placeholderData: {
      totalRecords: 0,
      todayQuantity: 0,
      weeklyTotal: 0,
      weeklyAverage: 0,
      monthlyTotal: 0,
      totalQuantity: 0,
      averageDaily: 0,
      averagePerAnimal: 0,
      lastRecordDate: null,
    },
  });
};


export const useUserStats = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery<UserStats, Error>({
    queryKey: ["dashboard", "users"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/users?stats=true");
        return response.data.stats;
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.warn("Authentication required for user stats - returning fallback data");
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch user statistics",
            type: "error",
          });
        }
        
        return {
          active: 1,
          total: 1,
          totalUsers: 1,
          activeUsers: 1,
          farmManagers: 1,
          employees: 0,
        };
      }
    },
    enabled: isAuthenticated && !authLoading,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: {
      active: 1,
      total: 1,
      totalUsers: 1,
      activeUsers: 1,
      farmManagers: 1,
      employees: 0,
    },
  });
};

export const useSystemHealth = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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
    enabled: isAuthenticated && !authLoading,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDashboardStats = () => {
  const animalStats = useAnimalStats();
  const productionStats = useProductionStats();
  const userStats = useUserStats();
  const systemHealth = useSystemHealth();

  return {
    animals: animalStats,
    production: productionStats,
    users: userStats,
    systemHealth: systemHealth,
    isLoading:
      animalStats.isLoading ||
      productionStats.isLoading ||
      userStats.isLoading ||
      systemHealth.isLoading,
    isError:
      animalStats.isError ||
      productionStats.isError ||
      userStats.isError ||
      systemHealth.isError,
    error:
      animalStats.error ||
      productionStats.error ||
      userStats.error ||
      systemHealth.error,
  };
};
export type { Animal };

