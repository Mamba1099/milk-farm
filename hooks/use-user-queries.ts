"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { User, AuthError } from "@/lib/types";

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ["user", "current"],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await apiClient.get<{ user: User }>(
          API_ENDPOINTS.auth.profile
        );
        
        if (response.data && response.data.user) {
          return response.data.user;
        }
        
        return null;
      } catch (error) {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
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
      // Clear React Query cache
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      
      // Clear any local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear any other auth-related items
      }
      
      console.log("Logout successful");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      
      // Still clear everything even if logout API fails
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  });
};

