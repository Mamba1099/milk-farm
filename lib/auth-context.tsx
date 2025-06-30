"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  useCurrentUser,
  useLoginMutation,
  useLogoutMutation,
  User,
  LoginInput,
} from "@/hooks/use-auth-hooks";
import { useAuthErrorHandler } from "@/hooks/use-auth-expiration";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFarmManager: boolean;
  isEmployee: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canEdit: boolean;
  canView: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // Use auth error handler hook
  useAuthErrorHandler();

  // Use the auth hooks
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  const isLoading = userLoading || !isInitialized;
  const isAuthenticated = !!user && !userError;
  const isFarmManager = user?.role === "FARM_MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";

  // Permission checks
  const canEdit = isFarmManager; // Only farm managers can edit
  const canView = isAuthenticated; // Both roles can view

  // Initialize auth state on mount
  useEffect(() => {
    // Just mark as initialized - the useCurrentUser hook will handle token validation
    setIsInitialized(true);
  }, []);

  // Handle authentication errors - clean up if user query fails
  useEffect(() => {
    if (isInitialized && userError && !userLoading) {
      // If there's an auth error and we're not loading, clear auth data
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, [userError, isInitialized, userLoading]);

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const login = async (credentials: LoginInput) => {
    try {
      const result = await loginMutation.mutateAsync(credentials);

      // Store token in localStorage and as httpOnly cookie
      localStorage.setItem("token", result.token);

      // Set cookie for server-side access
      document.cookie = `token=${result.token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; samesite=strict; secure=${process.env.NODE_ENV === "production"}`;

      // Refetch user data
      await refetchUser();

      // Redirect to dashboard (both roles use same dashboard)
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and cookies
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isFarmManager,
    isEmployee,
    login,
    logout,
    hasRole,
    hasAnyRole,
    canEdit,
    canView,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
