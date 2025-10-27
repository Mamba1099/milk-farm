"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ProductionAnimal, ProductionRecord, SalesRecord, CreateProductionData, CreateSalesData } from "@/lib/types/production";


export const useProductionReadyAnimals = () => {
  return useQuery<{ animals: ProductionAnimal[]; total: number }, Error>({
    queryKey: ["animals", "production-ready"],
    queryFn: async () => {
      const response = await apiClient.get("/animals/production-ready");
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    retry: 2,
  });
};

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
      records: ProductionRecord[];
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
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 2,
  });
};

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
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * create production record
 */
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

/**
 * create sales record
 */
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

/**
 * create system maturity update
 */
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

export const useProductionData = (dateRange: string = "today", customDate?: Date) => {
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
      case "custom":
        if (customDate) {
          const startOfCustomDay = new Date(
            customDate.getFullYear(),
            customDate.getMonth(),
            customDate.getDate()
          );
          return {
            startDate: startOfCustomDay.toISOString(),
            endDate: new Date(
              startOfCustomDay.getTime() + 24 * 60 * 60 * 1000
            ).toISOString(),
          };
        }
        return {};
      case "all":
      default:
        return {};
    }
  };

  const filters = getDateFilter();
  const { data, isLoading, refetch } = useProductionRecords(1, 100, filters);

  return {
    records: data?.records || [],
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

      const sumQuantities = (records: ProductionRecord[]) =>
        records
          .filter(record => record.animal.type !== "CALF")
          .reduce((sum, record) => sum + (record.quantity_am || 0) + (record.quantity_pm || 0), 0);

      const sumNetProduction = (records: ProductionRecord[]) =>
        records
          .filter(record => record.animal.type !== "CALF")
          .reduce((sum, record) => sum + (record.balance_am || 0) + (record.balance_pm || 0), 0);

      const getCarryOver = (summary: any) => {
        if (Array.isArray(summary?.data)) {
          return summary.data.reduce((sum: number, s: any) => sum + (s.final_balance || 0), 0);
        }
        return summary?.data?.final_balance || 0;
      };

      const todayProduction = sumQuantities(todayRes.data.records || []);
      const todayNetProduction = sumNetProduction(todayRes.data.records || []);
      const todayCarryOver = getCarryOver(todaySummaryRes);

      const weekProduction = sumQuantities(weekRes.data.records || []);
      const weekNetProduction = sumNetProduction(weekRes.data.records || []);
      const weekCarryOver = getCarryOver(weekSummaryRes);

      const monthProduction = sumQuantities(monthRes.data.records || []);
      const monthNetProduction = sumNetProduction(monthRes.data.records || []);
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
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

