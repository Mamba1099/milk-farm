"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

// Types for user data
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Check if farm manager exists (useful for UI decisions)
export const useFarmManagerExists = () => {
  return useQuery<boolean>({
    queryKey: ["user", "farm-manager-exists"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ exists: boolean }>(
          "/users/farm-manager-exists"
        );
        return response.data.exists;
      } catch {
        return false;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get registration endpoint status (health check)
export const useRegistrationStatus = () => {
  return useQuery<{ message: string; environment: string }>({
    queryKey: ["registration", "status"],
    queryFn: async () => {
      const response = await apiClient.get<{
        message: string;
        environment: string;
      }>(API_ENDPOINTS.auth.register);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};
