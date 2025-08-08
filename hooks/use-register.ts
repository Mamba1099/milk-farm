"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { RegisterInput } from "@/lib/validators/auth";
import {
  RegisterResponse,
  AuthError,
  ApiErrorResponse,
} from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { uploadImage } from "@/supabase/storage/client";

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<RegisterResponse, AuthError, RegisterInput>({
    mutationFn: async (data: RegisterInput) => {
      console.log("Registering user with data:", {
        ...data,
        password: "[HIDDEN]",
        confirmPassword: "[HIDDEN]",
        image: data.image ? "File provided" : "No file",
      });

      try {
        let imageUrl = null;
        
        // Upload image first if provided (same pattern as animals)
        if (data.image && data.image instanceof File) {
          console.log("Uploading image to Supabase...");
          const uploadResult = await uploadImage({
            file: data.image,
            bucket: "farm-house",
            folder: "users"
          });
          
          if (uploadResult.error) {
            throw new Error(uploadResult.error);
          }
          
          imageUrl = uploadResult.imagePath; // Store the path, not the full URL
          console.log("Image uploaded successfully, path:", imageUrl);
        }

        // Prepare form data with imageUrl instead of file
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("confirmPassword", data.confirmPassword);
        formData.append("role", data.role);
        
        if (imageUrl) {
          formData.append("imagePath", imageUrl);
        }

        console.log("Sending registration data to API");

        const response = await apiClient.post<RegisterResponse>(
          API_ENDPOINTS.auth.register,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error("Registration process error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        type: "success",
        title: "Account Created",
        description: data.message,
      });
      if (data.roleChanged) {
        toast({
          type: "warning",
          title: "Role Changed",
          description: `You were registered as ${data.assignedRole} instead of ${data.originalRole}`,
        });
        console.warn(
          `Role changed: ${data.originalRole} → ${data.assignedRole}`
        );
      }

      console.log("Registration successful:", data.message);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      if ('response' in error && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;

        if (apiError.details && Array.isArray(apiError.details)) {
          apiError.details.forEach((detail) => {
            toast({
              type: "error",
              title: `Validation Error: ${detail.field}`,
              description: detail.message,
            });
          });
        } else {
          toast({
            type: "error",
            title: "Registration Failed",
            description: apiError.error || "Unknown error occurred",
          });
        }
      } else if ('error' in error) {
        const directError = error as ApiErrorResponse;
        if (directError.details && Array.isArray(directError.details)) {
          directError.details.forEach((detail) => {
            toast({
              type: "error",
              title: `Validation Error: ${detail.field}`,
              description: detail.message,
            });
          });
        } else {
          toast({
            type: "error",
            title: "Registration Failed",
            description: directError.error || "Registration failed",
          });
        }
      } else if ('message' in error && error.message) {
        toast({
          type: "error",
          title: "Registration Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    },
  });
};
