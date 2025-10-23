"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import type { Sale, SalesStats, CreateSaleData } from "@/lib/types/sales";

export const useSales = (date?: string) => {
  const today = date || new Date().toISOString().split('T')[0];
  
  return useQuery<{ sales: Sale[]; total: number }>({
    queryKey: ["sales", today],
    queryFn: async () => {
      const response = await apiClient.get(`/sales?date=${today}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook to get sales statistics
export const useSalesStats = (date?: string) => {
  const today = date || new Date().toISOString().split('T')[0];
  
  return useQuery<SalesStats>({
    queryKey: ["sales", "stats", today],
    queryFn: async () => {
      const response = await apiClient.get(`/sales/stats?date=${today}`);
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
      const response = await apiClient.post("/sales", saleData);
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