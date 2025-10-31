"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth-context";
import type { Sale, SalesStats, CreateSaleData } from "@/lib/types/sales";

export const useSales = (dateRange: string = "today", customDate?: Date) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const getDateFilter = () => {
    const nowUTC = new Date();
    const todayUTC = new Date();

    const localToday = new Date();
    const todayLocal = new Date(Date.UTC(
      localToday.getFullYear(),
      localToday.getMonth(),
      localToday.getDate()
    ));

    switch (dateRange) {
      case "today":
        return {
          date: todayLocal.toISOString().split('T')[0]
        };
      case "yesterday":
        const yesterdayLocal = new Date(todayLocal);
        yesterdayLocal.setUTCDate(yesterdayLocal.getUTCDate() - 1);
        return {
          date: yesterdayLocal.toISOString().split('T')[0]
        };
      case "custom":
        if (customDate) {
          const customUTC = new Date(Date.UTC(
            customDate.getUTCFullYear(),
            customDate.getUTCMonth(),
            customDate.getUTCDate()
          ));
          return {
            date: customUTC.toISOString().split('T')[0]
          };
        }
        return {};
      case "week":
        const weekAgoLocal = new Date(todayLocal);
        weekAgoLocal.setUTCDate(weekAgoLocal.getUTCDate() - 7);
        return {
          startDate: weekAgoLocal.toISOString().split('T')[0],
          endDate: todayLocal.toISOString().split('T')[0]
        };
      case "month":
        const monthAgoLocal = new Date(todayLocal);
        monthAgoLocal.setUTCMonth(monthAgoLocal.getUTCMonth() - 1);
        return {
          startDate: monthAgoLocal.toISOString().split('T')[0],
          endDate: todayLocal.toISOString().split('T')[0]
        };
      case "all":
      default:
        return {};
    }
  };

  const filters = getDateFilter();
  const queryParams = new URLSearchParams();
  
  if (filters.date) {
    queryParams.append('date', filters.date);
  } else if (filters.startDate && filters.endDate) {
    queryParams.append('startDate', filters.startDate);
    queryParams.append('endDate', filters.endDate);
  }

  return useQuery<{ sales: Sale[]; total: number }>({
    queryKey: ["sales", dateRange, customDate?.toISOString()],
    queryFn: async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken || !user) {
        throw new Error("Not authenticated");
      }

      const response = await apiClient.get(`/api/sales?${queryParams.toString()}`);
      return response.data;
    },
    enabled: isAuthenticated && !authLoading && user !== null,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useSalesStats = (
  timeframe: 'today' | 'week' | 'month' = 'today',
  specificDate?: string
) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  return useQuery({
    queryKey: ['salesStats', timeframe, specificDate],
    queryFn: async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken || !user) {
        throw new Error("Not authenticated");
      }

      const params = new URLSearchParams();
      if (specificDate) {
        params.append('date', specificDate);
      } else {
        params.append('timeframe', timeframe);
      }

      const response = await apiClient.get(`/api/sales/stats?${params.toString()}`);
      return response.data;
    },
    enabled: isAuthenticated && !authLoading && user !== null,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  // toast from sonner

  return useMutation<Sale, Error, CreateSaleData>({
    mutationFn: async (saleData) => {
      const response = await apiClient.post("/api/sales", saleData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all sales-related queries
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["salesStats"] });
      
      // Invalidate production-related queries as sales affect available balance
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "production"
      });
      
      // Invalidate dashboard and analytics as sales affect overall stats
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "dashboard"
      });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["daily-balance"] });
      
      // Invalidate balance API as sales change available balance
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      
      toast.success("Sale recorded successfully");
    },
    onError: (error) => {
      console.error("Error creating sale:", error);
      
  toast.error("We couldn't record the sale. Please check your input or try again later.");
    },
  });
};