"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/lib/error-handler";
import { toast } from "@/components/ui/sonner";
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
        `/api/users?page=${page}&limit=${limit}`
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
      const response = await apiClient.get("/api/users?stats=true");
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
      const response = await apiClient.get(`/api/users/${id}`);
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
  // toast from sonner

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
          
          response = await apiClient.post("/api/users", formData, {
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
      
      toast.success(`Employee ${data.user.username} created successfully`);
      
      router.push("/accounts");
    },
    onError: (error: Error) => {
  toast.error("We couldn't add the employee. Please check your input or try again later.");
    },
  });
};


export const useCreateEmployeeByFarmManager = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  // toast from sonner

  return useMutation<{ user: Employee }, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      try {
        formData.set("role", "EMPLOYEE");
        
        const response = await apiClient.post("/api/register", formData, {
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
      
      toast.success(`Employee ${data.user.username} created successfully`);
      
      router.push("/accounts");
    },
    onError: (error: Error) => {
  toast.error("We couldn't add the employee. Please check your input or try again later.");
    },
  });
};

import { useAuth } from "@/lib/auth-context";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  // toast from sonner
  const { user: currentUser, setUser } = useAuth();

  return useMutation<
    { user: Employee },
    Error,
    { id: string; data: UpdateEmployeeInput; onCurrentUserUpdate?: (user: Employee) => void }
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

          const response = await apiClient.put(`/api/users/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return response.data;
        } else {
          const response = await apiClient.put(`/api/users/${id}`, data);
          return response.data;
        }
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (data, { id, onCurrentUserUpdate }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });

      if (currentUser && data.user.id === currentUser.id) {
        setUser?.(data.user);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("userName", data.user.username);
        }
        if (onCurrentUserUpdate) onCurrentUserUpdate(data.user);
      }

      toast.success(`User ${data.user.username} updated successfully`);
    },
    onError: (error: Error) => {
  toast.error("We couldn't update the user. Please check your input or try again later.");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  // toast from sonner

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/api/users/${id}`);
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
      
      toast.success("Employee deleted successfully");
    },
    onError: (error: Error) => {
  toast.error("We couldn't delete the employee. Please try again or contact support if the problem continues.");
    },
  });
};
