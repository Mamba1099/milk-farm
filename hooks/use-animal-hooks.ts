import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/lib/error-handler";
import { toast } from "@/components/ui/sonner";
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

      const response = await apiClient.get(`/api/animals?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 2,
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ["animal", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/animals/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 2,
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();
  const router = useRouter();


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
          imagePath = uploadResult.imageUrl;
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
        const response = await apiClient.post("/api/animals", formData, {
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
      toast.success(`Animal ${data.tagNumber} added successfully`);
      router.push("/animals");
    },
    onError: (error: Error) => {
  toast.error("We couldn't add the animal. Please check your input or try again later.");
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();


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
          imagePath = uploadResult.imageUrl;
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
          `/api/animals/${data.id}`,
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
      toast.success(`Animal ${data.tagNumber} updated successfully`);
    },
    onError: (error: Error) => {
  toast.error("We couldn't update the animal. Please check your input or try again later.");
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`/api/animals/${id}`);
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

      toast.success("Animal deleted successfully");
    },
    onError: (error: Error) => {
  toast.error("We couldn't delete the animal. Please try again or contact support if the problem continues.");
    },
  });
}

export function useTreatments(animalId?: string) {
  return useQuery({
    queryKey: ["treatments", animalId],
    queryFn: async () => {
      const params = animalId ? `?animalId=${animalId}` : "";
      const response = await apiClient.get(`/api/treatments${params}`);
      return response.data;
    },
  });
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (data: CreateTreatmentInput) => {
      try {
        const response = await apiClient.post("/api/treatments", data);
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
      queryClient.invalidateQueries({ queryKey: ["treatment-statistics"] });
      
      
      toast.success("Treatment record created successfully");
    },
    onError: (error: Error) => {
  toast.error("We couldn't save the treatment record. Please check your input or try again later.");
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

      const response = await apiClient.get(`/api/production?${params}`);
      return response.data;
    },
  });
}

export function useCreateProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductionInput) => {
      const response = await apiClient.post("/api/production", data);
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

      const response = await apiClient.get(`/api/animals?${params}`);
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

      const response = await apiClient.get(`/api/animals?${params}`);
      return response.data.animals;
    },
  });
}

export function useTreatmentDiseases() {
  return useQuery({
    queryKey: ["treatment-diseases"],
    queryFn: async () => {
      const response = await apiClient.get("/api/treatments?diseases=true");
      return response.data;
    },
  });
}

export function useTreatmentStatistics() {
  return useQuery({
    queryKey: ["treatment-statistics"],
    queryFn: async () => {
      const response = await apiClient.get("/api/treatments/statistics");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
