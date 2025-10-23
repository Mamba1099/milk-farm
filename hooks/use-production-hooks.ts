"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ProductionAnimal, ProductionRecord, SalesRecord, CreateProductionData, CreateSalesData } from "@/lib/types/production";


// Hook to get production-ready animals
export const useProductionReadyAnimals = () => {
  return useQuery<{ animals: ProductionAnimal[]; total: number }, Error>({
    queryKey: ["animals", "production-ready"],
    queryFn: async () => {
      const response = await apiClient.get("/animals/production-ready");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: "always", // Only refetch on mount if data is stale
    refetchOnReconnect: "always", // Only refetch on reconnect if data is stale
    retry: 2, // Limit retry attempts
  });
};

// Hook to get production records
export const useProductionRecords = (
  page: number = 1,
  limit: number = 10,
  filters?: {
    animalId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.animalId && { animalId: filters.animalId }),
    ...(filters?.date && { date: filters.date }),
    ...(filters?.startDate && { startDate: filters.startDate }),
    ...(filters?.endDate && { endDate: filters.endDate }),
  });

  return useQuery<
    {
      morningProductions: ProductionRecord[];
      eveningProductions: ProductionRecord[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    },
    Error
  >({
    queryKey: ["production", page, limit, filters],
    queryFn: async () => {
      const response = await apiClient.get(
        `/production?${queryParams.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: "always", // Only refetch on mount if data is stale
    retry: 2, // Limit retry attempts
  });
};

// Hook to get sales records
export const useSalesRecords = (
  page: number = 1,
  limit: number = 10,
  filters?: {
    animalId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.animalId && { animalId: filters.animalId }),
    ...(filters?.date && { date: filters.date }),
    ...(filters?.startDate && { startDate: filters.startDate }),
    ...(filters?.endDate && { endDate: filters.endDate }),
  });

  return useQuery<
    {
      sales: SalesRecord[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    },
    Error
  >({
    queryKey: ["sales", page, limit, filters],
    queryFn: async () => {
      const response = await apiClient.get(`/sales?${queryParams.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create production record
export const useCreateProduction = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateProductionData>({
    mutationFn: async (data: CreateProductionData) => {
      const response = await apiClient.post("/production", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

// Hook to create sales record
export const useCreateSales = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateSalesData>({
    mutationFn: async (data: CreateSalesData) => {
      const response = await apiClient.post("/sales", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

// Hook to run system maturity update
export const useUpdateMaturity = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; result: unknown },
    Error,
    { operation: "maturity" | "carry-over" | "both" }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post("/system/update-maturity", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Hook to get production data with date filtering
export const useProductionData = (dateRange: string = "today") => {
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
          startDate: startOfToday.toISOString(),
          endDate: new Date(
            startOfToday.getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        };
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
      case "quarter":
        const quarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
        return {
          startDate: startOfQuarter.toISOString(),
          endDate: new Date().toISOString(),
        };
      default:
        return {};
    }
  };

  const filters = getDateFilter();
  const { data, isLoading, refetch } = useProductionRecords(1, 100, filters);

  // Return morning and evening productions separately for new flow
  return {
    morningProductions: data?.morningProductions || [],
    eveningProductions: data?.eveningProductions || [],
    isLoading,
    refetch,
  };
};

export const useSalesData = (dateRange: string = "today") => {
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
          startDate: startOfToday.toISOString(),
          endDate: new Date(
            startOfToday.getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        };
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
      case "quarter":
        const quarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
        return {
          startDate: startOfQuarter.toISOString(),
          endDate: new Date().toISOString(),
        };
      default:
        return {};
    }
  };

  const filters = getDateFilter();
  const { data, isLoading, refetch } = useSalesRecords(1, 100, filters);

  return {
    data: data?.sales || [],
    isLoading,
    refetch,
  };
};

export const useProductionStats = () => {
  return useQuery<
    {
      todayProduction: number;
      todayNetProduction: number;
      todayCarryOver: number;
      weekProduction: number;
      weekNetProduction: number;
      weekCarryOver: number;
      monthProduction: number;
      monthNetProduction: number;
      monthCarryOver: number;
      activeAnimals: number;
      monthlySales: number;
    },
    Error
  >({
    queryKey: ["production", "stats"],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get production data
      const [todayRes, weekRes, monthRes, animalsRes, salesRes, todaySummaryRes, weekSummaryRes, monthSummaryRes] =
        await Promise.all([
          apiClient.get(`/production?startDate=${startOfToday.toISOString()}&endDate=${new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000).toISOString()}&limit=1000`),
          apiClient.get(`/production?startDate=${startOfWeek.toISOString()}&endDate=${new Date().toISOString()}&limit=1000`),
          apiClient.get(`/production?startDate=${startOfMonth.toISOString()}&endDate=${new Date().toISOString()}&limit=1000`),
          apiClient.get("/animals/production-ready"),
          apiClient.get(`/sales?startDate=${startOfMonth.toISOString()}&endDate=${new Date().toISOString()}&limit=1000`),
          apiClient.get(`/production/summary?date=${startOfToday.toISOString()}`),
          apiClient.get(`/production/summary?startDate=${startOfWeek.toISOString()}&endDate=${new Date().toISOString()}`),
          apiClient.get(`/production/summary?startDate=${startOfMonth.toISOString()}&endDate=${new Date().toISOString()}`),
        ]);

      // Aggregate morning/evening quantities
      const sumQuantities = (records: ProductionRecord[]) =>
        records.reduce((sum, record) => sum + (record.quantity_am || 0) + (record.quantity_pm || 0), 0);

      // Net production = sum of balances (morning + evening)
      const sumNetProduction = (records: ProductionRecord[]) =>
        records.reduce((sum, record) => sum + (record.balance_am || 0) + (record.balance_pm || 0), 0);

      // Carry-over: use balance_evening from summary
      const getCarryOver = (summary: any) => {
        if (Array.isArray(summary?.data)) {
          // For week/month, sum all balance_evening
          return summary.data.reduce((sum: number, s: any) => sum + (s.balance_evening || 0), 0);
        }
        return summary?.data?.balance_evening || 0;
      };

      const todayProduction = sumQuantities([...(todayRes.data.morningProductions || []), ...(todayRes.data.eveningProductions || [])]);
      const todayNetProduction = sumNetProduction([...(todayRes.data.morningProductions || []), ...(todayRes.data.eveningProductions || [])]);
      const todayCarryOver = getCarryOver(todaySummaryRes);

      const weekProduction = sumQuantities([...(weekRes.data.morningProductions || []), ...(weekRes.data.eveningProductions || [])]);
      const weekNetProduction = sumNetProduction([...(weekRes.data.morningProductions || []), ...(weekRes.data.eveningProductions || [])]);
      const weekCarryOver = getCarryOver(weekSummaryRes);

      const monthProduction = sumQuantities([...(monthRes.data.morningProductions || []), ...(monthRes.data.eveningProductions || [])]);
      const monthNetProduction = sumNetProduction([...(monthRes.data.morningProductions || []), ...(monthRes.data.eveningProductions || [])]);
      const monthCarryOver = getCarryOver(monthSummaryRes);

      const activeAnimals = animalsRes.data.total || 0;
      const monthlySales = salesRes.data.sales?.reduce((sum: number, record: SalesRecord) => sum + record.totalAmount, 0) || 0;

      return {
        todayProduction,
        todayNetProduction,
        todayCarryOver,
        weekProduction,
        weekNetProduction,
        weekCarryOver,
        monthProduction,
        monthNetProduction,
        monthCarryOver,
        activeAnimals,
        monthlySales,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
