"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import { apiClient } from '@/lib/api-client';
import type { 
  ServingRecord, 
  ServingResponse, 
  CreateServingData, 
  UpdateServingData, 
  ServingFilters,
  ServingStats 
} from '@/lib/types/serving';

export function useServings(filters?: ServingFilters) {
  return useQuery({
    queryKey: ['servings', filters],
    queryFn: async (): Promise<ServingResponse> => {
      const params = new URLSearchParams();
      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.servingType) params.append('servingType', filters.servingType);
      if (filters?.outcome) params.append('outcome', filters.outcome);
      if (filters?.ovaType) params.append('ovaType', filters.ovaType);
      if (filters?.search) params.append('search', filters.search);
      
      const url = `/api/servings?${params.toString()}`;
      
      try {
        const response = await apiClient.get(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching servings:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
}

export function useServingStats() {
  return useQuery({
    queryKey: ['serving-stats'],
    queryFn: async (): Promise<ServingStats> => {
      const response = await apiClient.get('/api/servings/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes  
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
}

export function useCreateServing(options?: { skipRedirect?: boolean }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  // toast from sonner

  return useMutation({
  mutationFn: async (data: CreateServingData): Promise<ServingRecord> => {
      const response = await apiClient.post('/api/servings', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all serving-related queries to ensure immediate updates
      queryClient.invalidateQueries({ queryKey: ['servings'] });
      queryClient.invalidateQueries({ queryKey: ['serving-stats'] });
      
      // Invalidate animal-related queries as servings affect animal status
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals', 'production-ready'] });
      
      // Invalidate production stats as servings affect active animals count
      queryClient.invalidateQueries({ queryKey: ['production'] });
      queryClient.invalidateQueries({ queryKey: ['production', 'stats'] });
      
      // Invalidate dashboard as serving affects animal stats
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'animals'] });
      
      toast.success('Serving record created successfully');
      // Only redirect if not disabled
      if (!options?.skipRedirect) {
        router.push('/production/serving');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create serving record';
  toast.error("We couldn't save the serving record. Please check your input or try again later.");
    },
  });
}

export function useUpdateServing() {
  const queryClient = useQueryClient();
  // toast from sonner

  return useMutation({
    mutationFn: async (data: UpdateServingData): Promise<ServingRecord> => {
      const response = await apiClient.put(`/api/servings/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all serving-related queries
      queryClient.invalidateQueries({ queryKey: ['servings'] });
      queryClient.invalidateQueries({ queryKey: ['serving-stats'] });
      
      // Invalidate animal-related queries as servings affect animal status
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals', 'production-ready'] });
      
      // Invalidate production stats as servings affect active animals count
      queryClient.invalidateQueries({ queryKey: ['production'] });
      queryClient.invalidateQueries({ queryKey: ['production', 'stats'] });
      
      // Invalidate dashboard as serving affects animal stats
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'animals'] });
      
      toast.success('Serving record updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update serving record';
  toast.error("We couldn't update the serving record. Please check your input or try again later.");
    },
  });
}

export function useDeleteServing() {
  const queryClient = useQueryClient();
  // toast from sonner

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/servings/${id}`);
    },
    onSuccess: () => {
      // Invalidate all serving-related queries
      queryClient.invalidateQueries({ queryKey: ['servings'] });
      queryClient.invalidateQueries({ queryKey: ['serving-stats'] });
      
      // Invalidate animal-related queries as servings affect animal status
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals', 'production-ready'] });
      
      // Invalidate production stats as servings affect active animals count
      queryClient.invalidateQueries({ queryKey: ['production'] });
      queryClient.invalidateQueries({ queryKey: ['production', 'stats'] });
      
      // Invalidate dashboard as serving affects animal stats
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'animals'] });
      
      toast.success('Serving record deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete serving record';
  toast.error("We couldn't delete the serving record. Please try again or contact support if the problem continues.");
    },
  });
}

export function canUpdateServing(createdAt: string): boolean {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);
  return diffInMinutes >= 5;
  
}

export function getTimeUntilUpdate(createdAt: string): string {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);
  
  const remainingMinutes = Math.max(0, 5 - diffInMinutes);
  
  if (remainingMinutes <= 0) return 'Ready to update';
  
  const minutes = Math.floor(remainingMinutes);
  const seconds = Math.floor((remainingMinutes - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
  
}
