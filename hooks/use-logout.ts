"use client";


import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/sonner";

export const useLogout = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post<{ message: string }>("/api/auth/logout", { userId });
      
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userName");
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Logged out successfully");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken"); 
      sessionStorage.removeItem("userName");
  toast.error("We couldn't log you out. Please refresh the page or try again later.");
    },
  });
};
