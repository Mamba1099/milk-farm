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

    if (config.url?.includes("/auth/logout")) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (tokenPayload.exp > currentTime) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn("Invalid token format during logout");
        }
      }
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (sessionExpiryNotified) {
        return Promise.reject(error);
      }

      if (!sessionExpiryNotified) {
        sessionExpiryNotified = true;
        console.error("Session expired");
        localStorage.removeItem("token");
        
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
    refresh: "/auth/refresh",
    profile: "/auth",
  },
} as const;
