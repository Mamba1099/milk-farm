"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/lib/error-handler";

// Types for employee management
export interface User {
  id: string;
  username: string;
  email: string;
  role: "FARM_MANAGER" | "EMPLOYEE";
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role: "FARM_MANAGER" | "EMPLOYEE";
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  role?: "FARM_MANAGER" | "EMPLOYEE";
  password?: string;
  image?: File;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hook to fetch all users
export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery<UsersResponse, Error>({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/users?page=${page}&limit=${limit}`
      );
      return response.data;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a single user
export const useUser = (id: string) => {
  return useQuery<{ user: User }, Error>({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
};

// Hook to create a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<{ user: User }, Error, CreateUserInput>({
    mutationFn: async (data: CreateUserInput) => {
      try {
        const response = await apiClient.post("/users", data);
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
    },
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { user: User },
    Error,
    { id: string; data: UpdateUserInput }
  >({
    mutationFn: async ({ id, data }) => {
      try {
        // Check if we have a file to upload
        if (data.image) {
          // Create FormData for file upload
          const formData = new FormData();
          if (data.username && data.username.trim() !== "") {
            formData.append("username", data.username);
          }
          if (data.email && data.email.trim() !== "") {
            formData.append("email", data.email);
          }
          if (data.role) {
            formData.append("role", data.role);
          }
          if (data.password && data.password.trim() !== "") {
            formData.append("password", data.password);
          }
          formData.append("image", data.image);

          const response = await apiClient.put(`/users/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return response.data;
        } else {
          // Regular JSON update without file
          const response = await apiClient.put(`/users/${id}`, data);
          return response.data;
        }
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Invalidate specific user
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
    },
  });
};

// Hook to delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/users/${id}`);
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
    },
  });
};
