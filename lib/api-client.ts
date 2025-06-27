import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: "/api", // Use relative path for API calls
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth-token");
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
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("auth-token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    register: "/register",
    login: "/login",
    logout: "/logout",
    profile: "/profile",
  },
  // Add more endpoints as needed
} as const;
