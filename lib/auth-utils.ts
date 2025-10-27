/**
 * Utility functions for authentication data management
 */

import { apiClient, API_ENDPOINTS } from "./api-client";

/**
 * Clear authentication data and check if user is still authenticated
 * Returns true if user is still authenticated (shouldn't happen), false if logged out
 */
export const clearAuthData = async (): Promise<boolean> => {
  try {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    await apiClient.get(API_ENDPOINTS.auth.profile);
    console.warn("User still authenticated after clearing session cookie");
    return true;
    
  } catch (error: any) {
    if (error.response?.status === 401) {
      return false;
    }
    
    console.error("Error during auth check:", error);
    return false;
  }
};

export const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    clearAuthData();
    window.location.replace('/login');
  }
};

export const redirectToDashboard = (): void => {
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard');
  }
};