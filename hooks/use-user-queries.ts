"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User, AuthError } from "@/lib/types";

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ["user", "current"],
    queryFn: async (): Promise<User | null> => {
      try {
        if (typeof window !== 'undefined' && !sessionStorage.getItem("accessToken")) {
          return null;
        }
        
        const response = await apiClient.get<{ user: User }>("/api/auth/me");
        
        if (response.data && response.data.user) {
          return response.data.user;
        }
        
        return null;
      } catch (error) {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            return null;
          }
        }

        console.warn("User query failed:", error);
        return null;
      }
    },
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return false;
        }
      }
      return failureCount < 1;
    },
    enabled: typeof window !== 'undefined' && !!sessionStorage.getItem("accessToken"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
};

export const useFarmManagerExists = () => {
  return useQuery<boolean>({
    queryKey: ["user", "farm-manager-exists"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ exists: boolean }>(
          "/api/users/farm-manager-exists"
        );
        return response.data.exists;
      } catch (error) {
        console.warn("Failed to check farm manager existence, defaulting to false:", error);
        return false;
      }
    },
    staleTime: 0,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AuthError, void>({
    mutationFn: async () => {
      const response = await apiClient.post("/api/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
    },
  });
};

