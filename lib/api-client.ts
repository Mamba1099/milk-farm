import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: "/api", // Use relative path for API calls
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous logout attempts
let isLoggingOut = false;

// Helper function to handle token expiration
const handleTokenExpiration = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  // Clear tokens
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  // Show session expired message
  if (typeof window !== 'undefined') {
    // Use a custom event to notify the auth context
    window.dispatchEvent(new CustomEvent('tokenExpired', {
      detail: { message: 'Your session has expired. Please log in again.' }
    }));

    // Redirect to login after a brief delay
    setTimeout(() => {
      window.location.href = '/login';
      isLoggingOut = false;
    }, 1500);
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired/invalid)
    if (error.response?.status === 401) {
      // Skip logout handling for login endpoint
      const isLoginEndpoint =
        error.config?.url?.includes("/auth") &&
        error.config?.method === "post" &&
        !error.config?.url?.includes("/logout");

      if (!isLoginEndpoint) {
        handleTokenExpiration();
      }
    }

    // Handle common errors
    console.error("API Error:", error);
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
  // Add more endpoints as needed
} as const;
