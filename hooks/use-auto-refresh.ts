"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string | null;
  };
}

export const useAutoRefresh = () => {
  return useMutation<RefreshResponse, Error, RefreshRequest>({
    mutationFn: async ({ refreshToken }: RefreshRequest) => {
      const response = await apiClient.post<RefreshResponse>("/api/auth/refresh", { refreshToken });
      sessionStorage.setItem("accessToken", response.data.accessToken);
      
      return response.data;
    },
    onSuccess: (data) => {
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userName");
    },
  });
};
