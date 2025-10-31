"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/sonner";
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
  // toast from sonner
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  return useQuery<DashboardStats["animals"], Error>({
    queryKey: ["dashboard", "animals"],
    queryFn: async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken || !user) {
          throw new Error("Not authenticated");
        }

        const response = await apiClient.get("/api/animals?limit=1000");
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
        
  toast.error("We couldn't load animal statistics. Please refresh or try again later.");
        throw new Error("Failed to fetch animal statistics");
      }
    },
    enabled: isAuthenticated && !authLoading && user !== null,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
  // toast from sonner
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  return useQuery<DashboardStats["production"], Error>({
    // Always use UTC for today, week, and month calculations
    queryKey: ["dashboard", "production", (() => {
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split('T')[0];
    })()],
    queryFn: async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken || !user) {
          throw new Error("Not authenticated");
        }

        // Always use UTC for today
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const weekAgoUTC = new Date(todayUTC.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgoUTC = new Date(todayUTC.getTime() - 30 * 24 * 60 * 60 * 1000);

        const todayString = todayUTC.toISOString().split('T')[0];
        const weekAgoString = weekAgoUTC.toISOString();
        const monthAgoString = monthAgoUTC.toISOString();

        const todayResponse = await apiClient.get(`/api/production?date=${todayString}&limit=1000`);
        const todayRecords = todayResponse.data.records || [];
        const todayProductions = todayRecords.filter((p: ProductionRecord) => p.animal.type !== "CALF");
  
        const allResponse = await apiClient.get("/api/production?limit=1000");
        const allRecords = allResponse.data.records || [];
        const allProductions = allRecords.filter((p: ProductionRecord) => p.animal.type !== "CALF");

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

        const weeklyProductions = allProductions.filter((p: ProductionRecord) => {
          const recordDate = new Date(p.date);
          return recordDate >= weekAgoUTC;
        });
        
        const monthlyProductions = allProductions.filter((p: ProductionRecord) => {
          const recordDate = new Date(p.date);
          return recordDate >= monthAgoUTC;
        });

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
        
  toast.error("We couldn't load production statistics. Please refresh or try again later.");
        throw new Error("Failed to fetch production statistics");
      }
    },
    enabled: isAuthenticated && !authLoading && user !== null,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
  // toast from sonner
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  return useQuery<UserStats, Error>({
    queryKey: ["dashboard", "users"],
    queryFn: async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken || !user) {
          throw new Error("Not authenticated");
        }

        const response = await apiClient.get("/api/users?stats=true");
        return response.data.stats;
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.warn("Authentication required for user stats - returning fallback data");
        } else {
    toast.error("We couldn't load user statistics. Please refresh or try again later.");
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
    enabled: isAuthenticated && !authLoading && user !== null,
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
  // toast from sonner
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  return useQuery<SystemHealth, Error>({
    queryKey: ["dashboard", "systemHealth"],
    queryFn: async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken || !user) {
          throw new Error("Not authenticated");
        }

        const response = await apiClient.get("/api/system/health");
        return response.data.health;
      } catch (error) {
  toast.error("We couldn't load system health data. Please refresh or try again later.");
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
    enabled: isAuthenticated && !authLoading && user !== null,
    retry: (failureCount, error: any) => {
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

