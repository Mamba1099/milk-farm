"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogoutMutation } from "@/hooks/use-user-queries";
import { useLoginMutation } from "@/hooks/use-login";
import { LoginInput, AuthContextType, AuthProviderProps } from "@/lib/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();
  
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  const isLoading = userLoading;
  const isAuthenticated = !!user && !userError;
  const isFarmManager = user?.role === "FARM_MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";

  const canEdit = isFarmManager;
  const canView = isAuthenticated;

  useEffect(() => {
    if (!isLoading) {
      const currentPath = window.location.pathname;
      const isAuthPage = ["/login", "/signup"].includes(currentPath);
      const isProtectedRoute = currentPath.startsWith("/dashboard") || 
                              currentPath.startsWith("/admin") ||
                              currentPath.startsWith("/animals") ||
                              currentPath.startsWith("/production") ||
                              currentPath.startsWith("/employees") ||
                              currentPath.startsWith("/reports");

      if (!isAuthenticated && isProtectedRoute) {
        router.replace("/login");
      } else if (isAuthenticated && isAuthPage) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, router]);

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
      await loginMutation.mutateAsync(credentials);
      await refetchUser();
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
      await refetchUser();
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
