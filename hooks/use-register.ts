"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { RegisterInput } from "@/lib/validators/auth";
import {
  RegisterResponse,
  AuthError,
  ApiErrorResponse,
} from "@/lib/types";
import { uploadImage } from "@/supabase/storage/client";
import { useToast } from "@/hooks/use-toast";

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<RegisterResponse, AuthError, RegisterInput>({
    mutationFn: async (data: RegisterInput) => {
      let imageUrl: string | null = null;
      
      if (data.image && data.image instanceof File) {
        console.log("Uploading user image to Supabase...");
        const uploadResult = await uploadImage({
          file: data.image,
          bucket: "farm-house",
          folder: "users",
        });

        if (uploadResult.error) {
          console.error("Upload failed:", uploadResult.error);
          toast({
            type: "error",
            title: "Upload Failed",
            description: "Failed to upload profile image. Please try again.",
          });
          throw new Error("Failed to upload profile image");
        }

        imageUrl = uploadResult.imageUrl;
        console.log("User image uploaded successfully:", imageUrl);

        const urlParts = imageUrl.split("/farm-house/");
        imageUrl = urlParts[1] || imageUrl;
      }
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        image: imageUrl,
      };

      console.log("Registering user with payload:", {
        ...payload,
        password: "[HIDDEN]",
        confirmPassword: "[HIDDEN]",
      });

      const response = await apiClient.post<RegisterResponse>(
        API_ENDPOINTS.auth.register,
        payload
      );

      return response.data;
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
