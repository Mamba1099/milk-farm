"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { User, AuthError } from "@/lib/types";

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ["user", "current"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ user: User }>(
          API_ENDPOINTS.auth.profile
        );
        return response.data.user;
      } catch (error) {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            return null;
          }
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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

