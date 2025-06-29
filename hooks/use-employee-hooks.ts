"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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
      const response = await apiClient.post("/users", data);
      return response.data;
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
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
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
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
    },
  });
};
