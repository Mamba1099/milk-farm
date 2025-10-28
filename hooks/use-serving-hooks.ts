"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
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
  });
}

export function useServingStats() {
  return useQuery({
    queryKey: ['serving-stats'],
    queryFn: async (): Promise<ServingStats> => {
      const response = await apiClient.get('/api/servings/stats');
      return response.data;
    },
  });
}

export function useCreateServing() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
  mutationFn: async (data: CreateServingData): Promise<ServingRecord> => {
      const response = await apiClient.post('/api/servings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servings'] });
      queryClient.invalidateQueries({ queryKey: ['serving-stats'] });
      toast({
        type: 'success',
        title: 'Success',
        description: 'Serving record created successfully',
      });
      router.push('/production/serving');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create serving record';
      toast({
        type: 'error',
        title: 'Error',
        description: message,
      });
    },
  });
}

export function useUpdateServing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateServingData): Promise<ServingRecord> => {
      const response = await apiClient.put(`/api/servings/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servings'] });
      queryClient.invalidateQueries({ queryKey: ['serving-stats'] });
      toast({
        type: 'success',
        title: 'Success',
        description: 'Serving record updated successfully',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update serving record';
      toast({
        type: 'error',
        title: 'Error',
        description: message,
      });
    },
  });
}

export function useDeleteServing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/servings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servings'] });
      queryClient.invalidateQueries({ queryKey: ['serving-stats'] });
      toast({
        type: 'success',
        title: 'Success',
        description: 'Serving record deleted successfully',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete serving record';
      toast({
        type: 'error',
        title: 'Error',
        description: message,
      });
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
