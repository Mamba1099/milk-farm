"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { User } from "@/lib/types";

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
          if (axiosError.response?.status === 401) {
            return null;
          }
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
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

