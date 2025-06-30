"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Types
export interface ProductionAnimal {
  id: string;
  tagNumber: string;
  name?: string;
  type: "COW" | "BULL" | "CALF";
  image?: string;
  motherOf: Array<{
    id: string;
    tagNumber: string;
    name?: string;
    birthDate: string;
  }>;
}

export interface ProductionRecord {
  id: string;
  animalId: string;
  date: string;
  morningQuantity: number;
  eveningQuantity: number;
  totalQuantity: number;
  calfQuantity: number;
  poshoQuantity: number;
  availableForSales: number;
  carryOverQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  animal: ProductionAnimal;
  recordedBy: {
    id: string;
    username: string;
  };
}

export interface SalesRecord {
  id: string;
  animalId?: string;
  date: string;
  timeRecorded: string;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  customerName?: string;
  notes?: string;
  animal?: ProductionAnimal;
  soldBy: {
    id: string;
    username: string;
  };
}

export interface CreateProductionData {
  animalId: string;
  date: string;
  morningQuantity: number;
  eveningQuantity: number;
  calfQuantity?: number;
  poshoQuantity?: number;
  notes?: string;
}

export interface CreateSalesData {
  animalId?: string;
  date: string;
  quantity: number;
  pricePerLiter: number;
  customerName?: string;
  notes?: string;
}

// Hook to get production-ready animals
export const useProductionReadyAnimals = () => {
  return useQuery<{ animals: ProductionAnimal[]; total: number }, Error>({
    queryKey: ["animals", "production-ready"],
    queryFn: async () => {
      const response = await apiClient.get("/animals/production-ready");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
      productions: ProductionRecord[];
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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

  return useMutation<ProductionRecord, Error, CreateProductionData>({
    mutationFn: async (data: CreateProductionData) => {
      const response = await apiClient.post("/production", data);
      return response.data.production;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Hook to create sales record
export const useCreateSales = () => {
  const queryClient = useQueryClient();

  return useMutation<SalesRecord, Error, CreateSalesData>({
    mutationFn: async (data: CreateSalesData) => {
      const response = await apiClient.post("/sales", data);
      return response.data.sales;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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

  return {
    data: data?.productions || [],
    isLoading,
    refetch,
  };
};

// Hook to get sales data with date filtering
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

// Hook to get production statistics
export const useProductionStats = () => {
  return useQuery<
    {
      todayProduction: number;
      weekProduction: number;
      monthProduction: number;
      activeAnimals: number;
      monthlySales: number;
    },
    Error
  >({
    queryKey: ["production", "stats"],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get production data
      const [todayRes, weekRes, monthRes, animalsRes, salesRes] =
        await Promise.all([
          apiClient.get(
            `/production?startDate=${startOfToday.toISOString()}&endDate=${new Date(
              startOfToday.getTime() + 24 * 60 * 60 * 1000
            ).toISOString()}&limit=1000`
          ),
          apiClient.get(
            `/production?startDate=${startOfWeek.toISOString()}&limit=1000`
          ),
          apiClient.get(
            `/production?startDate=${startOfMonth.toISOString()}&limit=1000`
          ),
          apiClient.get("/animals/production-ready"),
          apiClient.get(
            `/sales?startDate=${startOfMonth.toISOString()}&limit=1000`
          ),
        ]);

      const todayProduction =
        todayRes.data.productions?.reduce(
          (sum: number, record: ProductionRecord) => sum + record.totalQuantity,
          0
        ) || 0;

      const weekProduction =
        weekRes.data.productions?.reduce(
          (sum: number, record: ProductionRecord) => sum + record.totalQuantity,
          0
        ) || 0;

      const monthProduction =
        monthRes.data.productions?.reduce(
          (sum: number, record: ProductionRecord) => sum + record.totalQuantity,
          0
        ) || 0;

      const activeAnimals = animalsRes.data.total || 0;

      const monthlySales =
        salesRes.data.sales?.reduce(
          (sum: number, record: SalesRecord) => sum + record.totalAmount,
          0
        ) || 0;

      return {
        todayProduction,
        weekProduction,
        monthProduction: monthProduction,
        activeAnimals,
        monthlySales,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
