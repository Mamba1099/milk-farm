"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import {
  LoginResponse,
  LoginInput,
  AuthError,
  ApiErrorResponse,
} from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { sessionManager } from "@/lib/session-manager";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<LoginResponse, AuthError, LoginInput>({
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.auth.login,
        data
      );

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      if (data.session) {
        sessionManager.setSessionInfo({
          startTime: data.session.startTime,
          endTime: data.session.endTime,
          duration: data.session.duration,
        });
      }

      toast({
        type: "success",
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error) => {
      console.error("Login failed:", error);

      if ('response' in error && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        
        if (apiError.details && Array.isArray(apiError.details)) {
          apiError.details.forEach((detail) => {
            toast({
              type: "error",
              title: `Login Error: ${detail.field}`,
              description: detail.message,
            });
          });
        } else {
          toast({
            type: "error",
            title: "Login Failed",
            description: apiError.error || "Invalid credentials",
          });
        }
      } else if ('error' in error) {
        const directError = error as ApiErrorResponse;
        toast({
          type: "error",
          title: "Login Failed",
          description: directError.error || "Login failed",
        });
      } else if ('message' in error && error.message) {
        toast({
          type: "error",
          title: "Login Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
        });
      }
    },
  });
};
