"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { RegisterInput } from "@/lib/validators/auth";
import {
  RegisterResponse,
  AuthError,
  ApiErrorResponse,
} from "@/lib/types";
import { toast } from "@/components/ui/sonner";
import { uploadImage } from "@/supabase/storage/client";

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, AuthError, RegisterInput>({
    mutationFn: async (data: RegisterInput) => {

      try {
        let imageUrl = null;
        if (data.image && data.image instanceof File) {
          const uploadResult = await uploadImage({
            file: data.image,
            bucket: "farm-house",
            folder: "users"
          });
          
          if (uploadResult.error) {
            throw new Error(uploadResult.error);
          }
          
          imageUrl = uploadResult.imagePath;
        }

        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("confirmPassword", data.confirmPassword);
        formData.append("role", data.role);
        
        if (imageUrl) {
          formData.append("imagePath", imageUrl);
        }

        const response = await apiClient.post<RegisterResponse>(
          "/api/register",
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
      toast.success(data.message);
      if (data.roleChanged) {
        toast.warning(`You were registered as ${data.assignedRole} instead of ${data.originalRole}`);
        console.warn(
          `Role changed: ${data.originalRole} → ${data.assignedRole}`
        );
      }

    },
    onError: (error) => {
      console.error("Registration failed:", error);
      if ('response' in error && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;

        if (apiError.details && Array.isArray(apiError.details)) {
          apiError.details.forEach((detail) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(apiError.error || "Unknown error occurred");
        }
      } else if ('error' in error) {
        const directError = error as ApiErrorResponse;
        if (directError.details && Array.isArray(directError.details)) {
          directError.details.forEach((detail) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(directError.error || "Registration failed");
        }
      } else if ('message' in error && error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
  });
};
