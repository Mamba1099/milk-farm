"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { isTokenExpired } from "@/lib/jwt-utils";

// Types
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string | null;
    createdAt: string;
  };
  token: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
}

export interface AuthError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Login mutation
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, AuthError, LoginInput>({
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.auth.login,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Store user data in query cache
      queryClient.setQueryData(["user"], data.user);
      console.log("Login successful:", data.message);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

// Logout mutation
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AuthError, void>({
    mutationFn: async () => {
      const response = await apiClient.post(API_ENDPOINTS.auth.logout);
      return response.data;
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      console.log("Logout successful");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Even if logout API fails, clear local data
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
    },
  });
};

// Refresh token mutation
export const useRefreshTokenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, AuthError, void>({
    mutationFn: async () => {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.auth.refresh
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(["user"], data.user);
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
      // Clear user data if refresh fails
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });
};

// Get current user from token
export const useCurrentUser = () => {
  return useQuery<User | null, AuthError>({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      // Check if token is expired locally first
      if (isTokenExpired(token)) {
        // Remove expired token
        localStorage.removeItem("token");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return null;
      }

      try {
        // Validate token with server by calling /auth/me
        const response = await apiClient.get<{ user: User }>("/auth/me");
        return response.data.user;
      } catch (error: unknown) {
        // If server rejects token (401, 403, etc.), clear it locally
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        return null;
      }
    },
    retry: (failureCount, error: unknown) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
