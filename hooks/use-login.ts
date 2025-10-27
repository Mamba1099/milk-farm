"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import {
  LoginResponse,
  LoginInput,
  AuthError,
  ApiErrorResponse,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<LoginResponse, AuthError, LoginInput>({
    mutationFn: async (credentials: LoginInput) => {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.auth.login,
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      toast({
        type: "success",
        title: "Welcome Back!",
        description: `Login successful. Welcome, ${data.user.username}!`,
      });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      if ('response' in error && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        
        if (apiError.details?.length) {
          apiError.details.forEach((detail) => {
            toast({
              type: "error",
              title: "Validation Error",
              description: `${detail.field}: ${detail.message}`,
            });
          });
          return;
        }
        
        toast({
          type: "error",
          title: "Login Failed", 
          description: apiError.error || "Invalid credentials",
        });
        return;
      }

      if ('error' in error) {
        const directError = error as ApiErrorResponse;
        toast({
          type: "error",
          title: "Login Failed",
          description: directError.error || "Authentication failed",
        });
        return;
      }

      toast({
        type: "error",
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
      });
    },
  });
};
