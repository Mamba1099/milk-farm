import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/lib/error-handler";
import type {
  CreateAnimalInput,
  UpdateAnimalInput,
  AnimalQuery,
  CreateTreatmentInput,
  CreateProductionInput,
} from "@/lib/validators/animal";

// Animal queries
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
  });
}

// Animal mutations
export function useCreateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnimalInput) => {
      try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "image" && value instanceof File) {
              formData.append(key, value);
            } else if (key === "birthDate" && value instanceof Date) {
              formData.append(key, value.toISOString());
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        const response = await apiClient.post("/animals", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
    },
    onSuccess: () => {
      // Invalidate all animal-related queries
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["available-parents"] });
      queryClient.invalidateQueries({
        queryKey: ["available-production-animals"],
      });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAnimalInput) => {
      try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "image" && value instanceof File) {
              formData.append(key, value);
            } else if (key === "birthDate" && value instanceof Date) {
              formData.append(key, value.toISOString());
            } else {
              formData.append(key, value.toString());
            }
          }
        });

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
      // Invalidate all animal-related queries
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animal", data.id] });
      queryClient.invalidateQueries({ queryKey: ["available-parents"] });
      queryClient.invalidateQueries({
        queryKey: ["available-production-animals"],
      });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();

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
      // Invalidate all animal-related queries
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["available-parents"] });
      queryClient.invalidateQueries({
        queryKey: ["available-production-animals"],
      });
      // Invalidate treatments and production records
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["servings"] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// Treatment queries and mutations
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

  return useMutation({
    mutationFn: async (data: CreateTreatmentInput) => {
      const response = await apiClient.post("/treatments", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate treatment queries
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      // Invalidate animal queries to update health status
      queryClient.invalidateQueries({ queryKey: ["animal", data.animalId] });
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// Production queries and mutations
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
      // Invalidate production queries
      queryClient.invalidateQueries({ queryKey: ["production"] });
      // Invalidate sales queries (production affects available sales)
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      // Invalidate animal queries
      queryClient.invalidateQueries({ queryKey: ["animal", data.animalId] });
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// Helper queries
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
