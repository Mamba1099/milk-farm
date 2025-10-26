"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { User, AuthError } from "@/lib/types";

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ["user", "current"],
    queryFn: async (): Promise<User | null> => {
      try {
        console.log("Fetching current user data...");
        const response = await apiClient.get<{ user: User }>(
          API_ENDPOINTS.auth.profile
        );
        
        if (response.data && response.data.user) {
          console.log("User data fetched successfully");
          return response.data.user;
        }
        
        return null;
      } catch (error) {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            console.log("User authentication failed - 401/403");
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
          "/users/farm-manager-exists"
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
      const response = await apiClient.post(API_ENDPOINTS.auth.logout);
      return response.data;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      
      console.log("Logout successful");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
    },
  });
};

