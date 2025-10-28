import axios from "axios";

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
  baseURL: `${baseURL}`,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const accessToken = sessionStorage.getItem("accessToken");
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userName");
        
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
      
      return Promise.reject(error);
    }

    if (status === 403) {
      console.warn("403 Forbidden - insufficient permissions");
      return Promise.reject(error);
    }

    if (status >= 500) {
      console.error("Server error:", status);
    }

    return Promise.reject(error);
  }
);


