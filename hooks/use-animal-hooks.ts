import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/lib/error-handler";
import { useToast } from "@/hooks";
import { uploadImage } from "@/supabase/storage/client";
import type {
  CreateAnimalInput,
  UpdateAnimalInput,
  AnimalQuery,
  CreateTreatmentInput,
  CreateProductionInput,
} from "@/lib/validators/animal";

export function useAnimals(query?: Partial<AnimalQuery>) {
  return useQuery({
    queryKey: ["animals", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query?.page) params.set("page", query.page.toString());
      if (query?.limit) params.set("limit", query.limit.toString());
      if (query?.search) params.set("search", query.search);
      if (query?.type) params.set("type", query.type);
      if (query?.gender) params.set("gender", query.gender);
      if (query?.healthStatus) params.set("healthStatus", query.healthStatus);
      if (query?.isMatured !== undefined)
        params.set("isMatured", query.isMatured.toString());

      const response = await apiClient.get(`/animals?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: "always", // Only refetch on mount if data is stale
    retry: 2, // Limit retry attempts
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ["animal", id],
    queryFn: async () => {
      const response = await apiClient.get(`/animals/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: "always", // Only refetch on mount if data is stale
    retry: 2, // Limit retry attempts
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAnimalInput) => {
      try {
        let imagePath = null;
        if (data.image && data.image instanceof File) {
          const uploadResult = await uploadImage({
            file: data.image,
            bucket: "farm-house",
            folder: "animals"
          });
          if (uploadResult.error) {
            throw new Error(uploadResult.error);
          }
          imagePath = uploadResult.imageUrl; // Use imageUrl (full URL) instead of imagePath
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "image") {
              return;
            } else if (key === "birthDate" && value instanceof Date) {
              formData.append(key, value.toISOString());
            } else {
              formData.append(key, value.toString());
            }
          }
        });
        if (imagePath) {
          formData.append("imageUrl", imagePath);
        }
        const response = await apiClient.post("/animals", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["available-parents"] });
      queryClient.invalidateQueries({
        queryKey: ["available-production-animals"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        type: "success",
        title: "Success",
        description: `Animal ${data.tagNumber} added successfully`,
      });
      router.push("/animals");
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to add animal",
      });
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateAnimalInput) => {
      try {
        let imagePath = null;
        if (data.image && data.image instanceof File) {
          const uploadResult = await uploadImage({
            file: data.image,
            bucket: "farm-house",
            folder: "animals"
          });
          if (uploadResult.error) {
            throw new Error(uploadResult.error);
          }
          imagePath = uploadResult.imageUrl; // Use imageUrl (full URL) instead of imagePath
        }
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "image") {
              return;
            } else if (key === "birthDate" && value instanceof Date) {
              formData.append(key, value.toISOString());
            } else {
              formData.append(key, value.toString());
            }
          }
        });
        if (imagePath) {
          formData.append("imageUrl", imagePath);
        }
        const response = await apiClient.put(
          `/animals/${data.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animal", data.id] });
      queryClient.invalidateQueries({ queryKey: ["available-parents"] });
      queryClient.invalidateQueries({
        queryKey: ["available-production-animals"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        type: "success",
        title: "Success",
        description: `Animal ${data.tagNumber} updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to update animal",
      });
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`/animals/${id}`);
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["available-parents"] });
      queryClient.invalidateQueries({
        queryKey: ["available-production-animals"],
      });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["servings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });

      toast({
        type: "success",
        title: "Success",
        description: "Animal deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to delete animal",
      });
    },
  });
}

export function useTreatments(animalId?: string) {
  return useQuery({
    queryKey: ["treatments", animalId],
    queryFn: async () => {
      const params = animalId ? `?animalId=${animalId}` : "";
      const response = await apiClient.get(`/treatments${params}`);
      return response.data;
    },
  });
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTreatmentInput) => {
      try {
        const response = await apiClient.post("/treatments", data);
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["animal", data.animalId] });
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      
      toast({
        type: "success",
        title: "Success",
        description: "Treatment record created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Error",
        description: error.message || "Failed to create treatment record",
      });
    },
  });
}

export function useProduction(animalId?: string, date?: string) {
  return useQuery({
    queryKey: ["production", animalId, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (animalId) params.set("animalId", animalId);
      if (date) params.set("date", date);

      const response = await apiClient.get(`/production?${params}`);
      return response.data;
    },
  });
}

export function useCreateProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductionInput) => {
      const response = await apiClient.post("/production", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["animal", data.animalId] });
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useAvailableParents(gender?: "MALE" | "FEMALE") {
  return useQuery({
    queryKey: ["available-parents", gender],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (gender) params.set("gender", gender);
      params.set("isMatured", "true");
      params.set("limit", "100");

      const response = await apiClient.get(`/animals?${params}`);
      return response.data.animals;
    },
  });
}

export function useAvailableProductionAnimals() {
  return useQuery({
    queryKey: ["available-production-animals"],
    queryFn: async () => {
      const params = new URLSearchParams({
        gender: "FEMALE",
        isMatured: "true",
        limit: "100",
      });

      const response = await apiClient.get(`/animals?${params}`);
      return response.data.animals;
    },
  });
}

export function useTreatmentDiseases() {
  return useQuery({
    queryKey: ["treatment-diseases"],
    queryFn: async () => {
      const response = await apiClient.get("/treatments?diseases=true");
      return response.data;
    },
  });
}

export function useTreatmentStatistics() {
  return useQuery({
    queryKey: ["treatment-statistics"],
    queryFn: async () => {
      const response = await apiClient.get("/treatments/statistics");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
