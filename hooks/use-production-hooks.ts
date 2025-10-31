"use client";


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ProductionAnimal, ProductionRecord, SalesRecord, CreateProductionData, CreateSalesData } from "@/lib/types/production";
import { toast } from "@/components/ui/sonner";


export const useProductionReadyAnimals = () => {
  return useQuery<{ animals: ProductionAnimal[]; total: number }, Error>({
    queryKey: ["animals", "production-ready"],
    queryFn: async () => {
      const response = await apiClient.get("/api/animals/production-ready");
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
        `/api/production?${queryParams.toString()}`
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
      const response = await apiClient.get(`/api/sales?${queryParams.toString()}`);
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
      const response = await apiClient.post("/api/production", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "production"
      });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "dashboard"
      });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Production record created successfully");
    },
    onError: (error) => {
  toast.error("We couldn't save the production record. Please check your input or try again later.");
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
      const response = await apiClient.post("/api/sales", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "production"
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "dashboard"
      });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Sales record created successfully");
    },
    onError: (error) => {
  toast.error("We couldn't save the sales record. Please check your input or try again later.");
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
      const response = await apiClient.post("/api/system/update-maturity", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(data.message || "System maturity updated successfully");
    },
    onError: (error) => {
  toast.error("We couldn't update the system maturity. Please try again or contact support.");
    },
  });
};

export const useProductionData = (dateRange: string = "today", customDate?: Date) => {
  const getDateFilter = () => {
    const localToday = new Date();
    const todayLocal = new Date(Date.UTC(
      localToday.getFullYear(),
      localToday.getMonth(),
      localToday.getDate()
    ));

    switch (dateRange) {
      case "yesterday":
        const yesterdayLocal = new Date(todayLocal);
        yesterdayLocal.setUTCDate(yesterdayLocal.getUTCDate() - 1);
        return {
          date: yesterdayLocal.toISOString().split('T')[0]
        };
      case "today":
        return {
          date: todayLocal.toISOString().split('T')[0]
        };
      case "week":
        const startOfWeekLocal = new Date(todayLocal);
        startOfWeekLocal.setUTCDate(todayLocal.getUTCDate() - todayLocal.getUTCDay());
        return {
          startDate: startOfWeekLocal.toISOString().split('T')[0],
          endDate: todayLocal.toISOString().split('T')[0],
        };
      case "month":
        const startOfMonthLocal = new Date(Date.UTC(localToday.getFullYear(), localToday.getMonth(), 1));
        return {
          startDate: startOfMonthLocal.toISOString().split('T')[0],
           endDate: todayLocal.toISOString().split('T')[0],
        };
      case "quarter":
        const quarter = Math.floor(localToday.getMonth() / 3);
        const startOfQuarterLocal = new Date(Date.UTC(localToday.getFullYear(), quarter * 3, 1));
        return {
          startDate: startOfQuarterLocal.toISOString().split('T')[0],
          endDate: todayLocal.toISOString().split('T')[0],
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
    const nowUTC = new Date();
    const startOfTodayUTC = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate()
    ));

    switch (dateRange) {
      case "yesterday":
        const yesterdayUTC = new Date(startOfTodayUTC);
        yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
        return {
          startDate: yesterdayUTC.toISOString(),
          endDate: new Date(
            yesterdayUTC.getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        };
      case "today":
        return {
          startDate: startOfTodayUTC.toISOString(),
          endDate: new Date(
            startOfTodayUTC.getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        };
      case "week":
        const startOfWeekUTC = new Date(startOfTodayUTC);
        startOfWeekUTC.setUTCDate(startOfTodayUTC.getUTCDate() - startOfTodayUTC.getUTCDay());
        return {
          startDate: startOfWeekUTC.toISOString(),
          endDate: nowUTC.toISOString(),
        };
      case "month":
        const startOfMonthUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), 1));
        return {
          startDate: startOfMonthUTC.toISOString(),
          endDate: nowUTC.toISOString(),
        };
      case "quarter":
        const quarter = Math.floor(nowUTC.getUTCMonth() / 3);
        const startOfQuarterUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), quarter * 3, 1));
        return {
          startDate: startOfQuarterUTC.toISOString(),
          endDate: nowUTC.toISOString(),
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
    queryKey: ["production", "stats", new Date().toDateString()],
    queryFn: async () => {
      const nowUTC = new Date();
      const startOfTodayUTC = new Date(Date.UTC(
        nowUTC.getUTCFullYear(),
        nowUTC.getUTCMonth(),
        nowUTC.getUTCDate()
      ));
      const startOfWeekUTC = new Date(startOfTodayUTC);
      startOfWeekUTC.setUTCDate(startOfTodayUTC.getUTCDate() - startOfTodayUTC.getUTCDay());
      const startOfMonthUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), 1));

      const [todayRes, weekRes, monthRes, animalsRes, salesRes, todaySummaryRes, weekSummaryRes, monthSummaryRes] =
        await Promise.all([
          apiClient.get(`/api/production?startDate=${startOfTodayUTC.toISOString()}&endDate=${new Date(startOfTodayUTC.getTime() + 24 * 60 * 60 * 1000).toISOString()}&limit=1000`),
          apiClient.get(`/api/production?startDate=${startOfWeekUTC.toISOString()}&endDate=${nowUTC.toISOString()}&limit=1000`),
          apiClient.get(`/api/production?startDate=${startOfMonthUTC.toISOString()}&endDate=${nowUTC.toISOString()}&limit=1000`),
          apiClient.get("/api/animals/production-ready"),
          apiClient.get(`/api/sales?startDate=${startOfMonthUTC.toISOString()}&endDate=${nowUTC.toISOString()}&limit=1000`),
          apiClient.get(`/api/production/summary?date=${startOfTodayUTC.toISOString()}`),
          apiClient.get(`/api/production/summary?startDate=${startOfWeekUTC.toISOString()}&endDate=${nowUTC.toISOString()}`),
          apiClient.get(`/api/production/summary?startDate=${startOfMonthUTC.toISOString()}&endDate=${nowUTC.toISOString()}`),
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

/**
 * Hook to get morning total with yesterday's balance included
 */
export const useMorningTotalWithBalance = (date?: Date) => {
  // Always send the date as a UTC YYYY-MM-DD string
  let dateString: string;
  if (date) {
    dateString = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString().split('T')[0];
  } else {
    const now = new Date();
    dateString = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split('T')[0];
  }
  return useQuery<number, Error>({
    queryKey: ["production", "morning-total-with-balance", dateString],
    queryFn: async () => {
      const response = await apiClient.get(`/api/production/morning-total-with-balance?date=${dateString}`);
      return response.data.morningTotalWithBalance;
    },
    staleTime: 1 * 60 * 1000, 
    gcTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

