"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import type { Sale, SalesStats, CreateSaleData } from "@/lib/types/sales";

export const useSales = (dateRange: string = "today", customDate?: Date) => {
  const getDateFilter = () => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    switch (dateRange) {
      case "today":
        return {
          date: startOfToday.toISOString().split('T')[0]
        };
      case "yesterday":
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          date: yesterday.toISOString().split('T')[0]
        };
      case "custom":
        if (customDate) {
          const customStartOfDay = new Date(
            customDate.getFullYear(),
            customDate.getMonth(),
            customDate.getDate()
          );
          return {
            date: customStartOfDay.toISOString().split('T')[0]
          };
        }
        return {};
      case "week":
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        return {
          startDate: startOfWeek.toISOString(),
          endDate: new Date().toISOString(),
        };
      case "month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: startOfMonth.toISOString(),
          endDate: new Date().toISOString(),
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
      const response = await apiClient.get(`/api/sales?${queryParams.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSalesStats = (dateRange: string = "today", customDate?: Date) => {
  const getDateFilter = () => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    switch (dateRange) {
      case "today":
        return {
          date: startOfToday.toISOString().split('T')[0]
        };
      case "yesterday":
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          date: yesterday.toISOString().split('T')[0]
        };
      case "custom":
        if (customDate) {
          const customStartOfDay = new Date(
            customDate.getFullYear(),
            customDate.getMonth(),
            customDate.getDate()
          );
          return {
            date: customStartOfDay.toISOString().split('T')[0]
          };
        }
        return {};
      case "week":
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        return {
          startDate: startOfWeek.toISOString(),
          endDate: new Date().toISOString(),
        };
      case "month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: startOfMonth.toISOString(),
          endDate: new Date().toISOString(),
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
  
  return useQuery<SalesStats>({
    queryKey: ["sales", "stats", dateRange, customDate?.toISOString()],
    queryFn: async () => {
      const response = await apiClient.get(`/api/sales/stats?${queryParams.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Sale, Error, CreateSaleData>({
    mutationFn: async (saleData) => {
      const response = await apiClient.post("/api/sales", saleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      
      toast({
        title: "Success",
        description: "Sale recorded successfully",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error creating sale:", error);
      
      toast({
        title: "Error", 
        description: "Failed to record sale. Please try again.",
        type: "error",
      });
    },
  });
};