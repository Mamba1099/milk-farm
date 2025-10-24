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
      // Don't trigger global session expiry for auth/me calls (session checks)
      // These are handled specifically by the session manager
      if (originalRequest.url?.includes("/auth/me")) {
        console.log("Session check failed (/auth/me), letting session manager handle it");
        return Promise.reject(error);
      }
      
      console.log("401 error on non-session-check endpoint:", originalRequest.url);
      
      if (!sessionExpiryNotified) {
        sessionExpiryNotified = true;
        console.error("Session expired");
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tokenExpired', {
            detail: { message: 'Your session has expired. Please log in again.' }
          }));

          if (handleSessionExpiry) {
            handleSessionExpiry();
          } else {
            window.location.href = '/login';
          }
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
    productionCalfFeeding: "/analytics/production-calf-feeding",
    topProducingCows: "/analytics/top-producing-cows",
    treatmentCostTrends: "/analytics/treatment-cost-trends",
    treatmentExpenses: "/analytics/treatment-expenses",
    servingOutcomes: "/analytics/serving-outcomes",
    servingTypes: "/analytics/serving-types",
    breedingActivity: "/analytics/breeding-activity",
    calvingIntervals: "/analytics/calving-intervals",
    seasonalBreeding: "/analytics/seasonal-breeding",
  },
} as const;
