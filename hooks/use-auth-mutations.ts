import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { RegisterInput } from "@/lib/validators/auth";
import { uploadImage } from "@/lib/supabase";

// Types for the registration response
export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string | null;
    createdAt: string;
  };
  roleChanged?: boolean;
  originalRole?: string;
  assignedRole?: string;
}

export interface RegisterError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Registration mutation hook
export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, RegisterError, RegisterInput>({
    mutationFn: async (data: RegisterInput) => {
      let imageUrl: string | null = null;

      // Upload image to Supabase if provided
      if (data.image) {
        imageUrl = await uploadImage(data.image, "user-avatars");
        if (!imageUrl) {
          throw new Error("Failed to upload image");
        }
      }

      // Prepare the request payload
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        image: imageUrl,
      };

      // Make the API request
      const response = await apiClient.post<RegisterResponse>(
        API_ENDPOINTS.auth.register,
        payload
      );

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // You can add success notifications here
      console.log("Registration successful:", data.message);

      // Handle role change notification
      if (data.roleChanged) {
        console.warn(
          `Role changed: ${data.originalRole} → ${data.assignedRole}`
        );
      }
    },
    onError: (error) => {
      // Handle registration errors
      console.error("Registration failed:", error);
    },
  });
};

// Login mutation hook (placeholder for future use)
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
  };
  token: string;
}

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, RegisterError, LoginInput>({
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.auth.login,
        data
      );

      // Store the auth token
      if (response.data.token) {
        localStorage.setItem("auth-token", response.data.token);
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ["user"] });

      console.log("Login successful:", data.message);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};
