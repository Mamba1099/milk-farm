import axios from "axios";

let handleSessionExpiry: (() => void) | null = null;
let sessionExpiryNotified = false;

const baseURL = process.env.NEXT_API_URL || "http://localhost:3000";

export const setSessionExpiryHandler = (handler: () => void) => {
  handleSessionExpiry = handler;
};

export const resetSessionExpiryNotified = () => {
  sessionExpiryNotified = false;
};

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
  
    if (
      originalRequest.url?.includes("/auth") ||
      originalRequest.url?.includes("/farm-manager-exists") ||
      originalRequest._isRetry
    ) {
      return Promise.reject(error);
    }

    if (status === 401) {
      console.log("401 Unauthorized on API endpoint:", originalRequest.url);
      
      // For auth/me calls, just return the error - let the auth context handle it naturally
      if (originalRequest.url?.includes("/auth/me")) {
        console.log("Session check failed (/auth/me), returning error to auth context");
        return Promise.reject(error);
      }
      
      // Don't trigger if we're already on login page
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        console.log("Already on login page, not triggering session expiry");
        return Promise.reject(error);
      }
      
      // For other API calls, trigger session expiry only once
      if (!sessionExpiryNotified) {
        sessionExpiryNotified = true;
        console.log("Authentication failed on API call - dispatching token expired event");
        
        if (typeof window !== 'undefined') {
          // Clear auth data immediately
          localStorage.clear();
          sessionStorage.clear();
          document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          // Dispatch event for auth context to handle the page reload
          window.dispatchEvent(new CustomEvent('tokenExpired', {
            detail: { message: 'Your session has expired.' }
          }));
        }
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
