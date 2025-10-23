"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useLogoutMutation } from "@/hooks/use-user-queries";
import { useLoginMutation } from "@/hooks/use-login";
import { useSessionCheck } from "@/hooks/use-session-check";
import { useToast } from "@/hooks/use-toast";
import { LoginInput, AuthContextType, AuthProviderProps } from "@/lib/types";
import { sessionManager } from "@/lib/session-manager";

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
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [hasRedirected, setHasRedirected] = React.useState(false);
  const { toast } = useToast();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();
  
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const sessionCheckMutation = useSessionCheck();

  const isLoading = userLoading;
  const isAuthenticated = !!user && !userError;
  const isFarmManager = user?.role === "FARM_MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";

  const canEdit = isFarmManager;
  const canView = isAuthenticated;

  useEffect(() => {
    sessionManager.setSessionCheckMutation(sessionCheckMutation);
  }, [sessionCheckMutation]);

  useEffect(() => {
    sessionManager.setToastFunction(toast);
  }, [toast]);

  // Temporarily disable automatic session checking to break the loop
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     sessionManager.startSessionCheck(() => {
  //       console.log("Session expired, logging out...");
  //       handleSessionExpired();
  //     });
  //   } else {
  //     sessionManager.stopSessionCheck();
  //   }

  //   return () => {
  //     sessionManager.stopSessionCheck();
  //   };
  // }, [isAuthenticated]);

  const handleSessionExpired = async () => {
    if (isLoggingOut) {
      console.log("Logout already in progress, skipping...");
      return;
    }
    
    console.log("Session expired, logging out...");
    setIsLoggingOut(true);
    try {
      // Clear session first to prevent any further auth checks
      sessionManager.clearSession();
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      
      await logoutMutation.mutateAsync();
      window.location.replace("/login");
    } catch (error) {
      console.error("Error during session expiration logout:", error);
      window.location.replace("/login");
    } finally {
      setTimeout(() => setIsLoggingOut(false), 5000);
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoggingOut && !hasRedirected) {
      const currentPath = window.location.pathname;
      const isAuthPage = ["/login", "/signup"].includes(currentPath);
      const isProtectedRoute = currentPath.startsWith("/dashboard") || 
                              currentPath.startsWith("/animals") ||
                              currentPath.startsWith("/production") ||
                              currentPath.startsWith("/accounts") ||
                              currentPath.startsWith("/analytics") ||
                              currentPath.startsWith("/settings") ||
                              currentPath.startsWith("/sales");

      if (!isAuthenticated && isProtectedRoute) {
        console.log("Redirecting to login - not authenticated on protected route");
        setHasRedirected(true);
        window.location.replace("/login");
      } else if (isAuthenticated && isAuthPage && !isLoggingOut) {
        console.log("Redirecting to dashboard - authenticated on auth page");
        setHasRedirected(true);
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 100); // Small delay to prevent rapid redirects
      }
    }
  }, [isAuthenticated, isLoading, isLoggingOut, hasRedirected]);

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
    if (isLoggingOut) {
      console.log("Logout already in progress, skipping manual logout...");
      return;
    }
    
    console.log("Manual logout initiated...");
    setIsLoggingOut(true);
    setHasRedirected(false);
    
    try {
      // Clear session and cache first
      sessionManager.clearSession();
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      
      // Clear any local storage items that might be keeping auth state
      localStorage.clear();
      sessionStorage.clear();
      
      await logoutMutation.mutateAsync();
      
      // Force redirect to login and prevent redirect loops
      setTimeout(() => {
        window.location.replace("/login");
      }, 100);
      
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    } finally {
      // Reset the flag after a longer delay
      setTimeout(() => {
        setIsLoggingOut(false);
        setHasRedirected(false);
      }, 5000);
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
