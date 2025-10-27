import axios from "axios";
import { showToast } from "@/lib/toast-manager";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production") {
      return `${window.location.protocol}//${window.location.host}`;
    }
  }
  
  return process.env.NEXT_API_URL?.split(',')[0]?.trim() || 
         process.env.NEXTAUTH_URL || 
         "http://localhost:3000";
};

const baseURL = getBaseURL();

export const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;

    if (config.data && typeof config.data === 'object') {
      const sensitiveFields = ['password', 'confirmPassword', 'oldPassword', 'newPassword'];
      const hasPassword = sensitiveFields.some(field => field in config.data);
      
      if (hasPassword && process.env.NODE_ENV === 'development') {
        console.log('🔒 API Request with sensitive data hidden for security');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status } = error.response || {};

    // We want to handle 401s centrally, but avoid interfering with
    // auth mutation endpoints like login/logout. Previously we skipped
    // any request containing `/auth` which also skipped `/auth/me`.
    // That prevented the client from redirecting when the profile
    // endpoint returned 401 (expired token). Only skip known
    // auth mutation endpoints and other explicit paths.
    const url = originalRequest.url || "";
    const isAuthMutation = url.includes("/auth") && !url.includes("/auth/me");
    if (
      isAuthMutation ||
      url.includes("/farm-manager-exists") ||
      originalRequest._isRetry
    ) {
      return Promise.reject(error);
    }

    if (status === 401) {
      console.log("401 Unauthorized - checking if session expired");
      if (typeof window !== 'undefined') {
        // Check if this 401 is from /auth/me (user session check) or contains session expiry info
        const errorMessage = error.response?.data?.message || '';
        const isSessionExpiry = url.includes('/auth/me') || 
                               errorMessage.toLowerCase().includes('session expired') ||
                               errorMessage.toLowerCase().includes('token expired') ||
                               errorMessage.toLowerCase().includes('invalid or expired token');
        
        if (isSessionExpiry) {
          // Show toast notification for session expiry only
          showToast({
            type: "warning",
            title: "Session Expired",
            description: "Your session has expired. Redirecting to login...",
            duration: 3000
          });
        }
        
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Small delay to allow toast to show before redirect (if session expired)
        const delay = isSessionExpiry ? 1000 : 100;
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
        }, delay);
      }
      
      return Promise.reject(error);
    }

    if (status === 403) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('accessDenied', {
          detail: { message: "You don't have permission for this action" }
        }));
      }
      return Promise.reject(error);
    }

    if (status >= 500) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('serverError', {
          detail: { message: "Server error. Please try again later." }
        }));
      }
    }

    const errorToLog = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    };
    console.error("API Error:", errorToLog);
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  auth: {
    register: "/register",
    login: "/auth",
    logout: "/auth/logout",
    profile: "/auth/me",
  },
  analytics: {
    dailyProduction: "/analytics/daily-production",
    salesRevenue: "/analytics/sales-revenue",
    monthlyProduction: "/analytics/monthly-production",
    monthlySales: "/analytics/monthly-sales",
    productionCalfFeeding: "/analytics/production-calf-feeding",
    topProducingCows: "/analytics/top-producing-cows",
    treatmentCostTrends: "/analytics/treatment-cost-trends",
    treatmentExpense: "/analytics/treatment-expense",
    servingOutcomes: "/analytics/serving-outcomes",
    servingTypes: "/analytics/serving-types",
    breedingActivity: "/analytics/breeding-activity",
    calvingIntervals: "/analytics/calving-intervals",
    seasonalBreeding: "/analytics/seasonal-breeding",
  },
} as const;
