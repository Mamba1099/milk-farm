"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";
import { 
  Employee, 
  UpdateEmployeeInput, 
  EmployeesResponse 
} from "@/lib/types/employee";
import { RegisterInput } from "@/lib/validators/auth";

export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery<EmployeesResponse, Error>({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/users?page=${page}&limit=${limit}`
      );
      return response.data;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ["users", "stats"],
    queryFn: async () => {
      const response = await apiClient.get("/users?stats=true");
      return response.data;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUser = (id: string) => {
  return useQuery<{ user: Employee }, Error>({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<{ user: Employee }, Error, RegisterInput>({
    mutationFn: async (data: RegisterInput) => {
      try {
        let response;
        
        if (data.image) {
          const formData = new FormData();
          formData.append("username", data.username);
          formData.append("email", data.email);
          formData.append("password", data.password);
          formData.append("role", data.role);
          formData.append("image", data.image);
          
          response = await apiClient.post("/users", formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          const { confirmPassword, image, ...submitData } = data;
          response = await apiClient.post("/users", submitData);
        }
        
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      
      toast({
        type: "success",
        title: "Success",
        description: `Employee ${data.user.username} created successfully`,
      });
      
      router.push("/accounts");
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to create employee",
      });
    },
  });
};


export const useCreateEmployeeByFarmManager = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<{ user: Employee }, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      try {
        formData.set("role", "EMPLOYEE");
        
        const response = await apiClient.post("/register", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      
      toast({
        type: "success",
        title: "Success",
        description: `Employee ${data.user.username} created successfully`,
      });
      
      router.push("/accounts");
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to create employee",
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { user: Employee },
    Error,
    { id: string; data: UpdateEmployeeInput }
  >({
    mutationFn: async ({ id, data }) => {
      try {
        if (data.image) {
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
          const response = await apiClient.put(`/users/${id}`, data);
          return response.data;
        }
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
      
      toast({
        type: "success",
        title: "Success",
        description: `Employee ${data.user.username} updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to update employee",
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
      
      toast({
        type: "success",
        title: "Success",
        description: "Employee deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to delete employee",
      });
    },
  });
};
