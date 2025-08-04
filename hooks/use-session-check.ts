"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { SessionCheckResponse } from "@/lib/types";


export const useSessionCheck = () => {
  const { toast } = useToast();

  return useMutation<SessionCheckResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.get<SessionCheckResponse>(
        API_ENDPOINTS.auth.profile
      );
      return response.data;
    },
    onError: (error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number; data?: any } };
        
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return;
        }
      }
      
      toast({
        type: "error",
        title: "Session Check Failed",
        description: "Unable to verify session. Please check your connection.",
        duration: 3000,
      });
    },
    retry: false,
    gcTime: 0,
  });
};
