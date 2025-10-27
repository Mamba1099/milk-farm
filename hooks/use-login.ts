"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { LoginInput } from "@/lib/types/auth";

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string | null;
  };
}

export const useLogin = (onSuccess?: () => void) => {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (credentials: LoginInput) => {
      const response = await apiClient.post<LoginResponse>("/auth", credentials);
      
      sessionStorage.setItem("accessToken", response.data.accessToken);
      sessionStorage.setItem("refreshToken", response.data.refreshToken);
      sessionStorage.setItem("userName", response.data.user.username);
      
      return response.data;
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Login failed:", error);
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userName");
    },
  });
};

export const useLoginMutation = useLogin;
