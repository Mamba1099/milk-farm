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
import { isProtectedRoute, isAuthRoute, clearAuthData } from "@/lib/auth-utils";

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if ((currentPath === '/login' || currentPath === '/dashboard') && hasRedirected) {
        const resetTimer = setTimeout(() => {
          console.log("Resetting redirect state after successful navigation");
          setHasRedirected(false);
          setIsLoggingOut(false);
        }, 2000);
        
        return () => clearTimeout(resetTimer);
      }
    }
  }, [hasRedirected]);
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

  useEffect(() => {
    if (isAuthenticated && !isLoggingOut) {
      console.log("Starting session monitoring for authenticated user");
      sessionManager.startSessionCheck(() => {
        console.log("Session expired, triggering logout...");
        handleSessionExpired();
      });
    } else {
      console.log("Stopping session monitoring - user not authenticated or logging out");
      sessionManager.stopSessionCheck();
    }

    return () => {
      sessionManager.stopSessionCheck();
    };
  }, [isAuthenticated, isLoggingOut]);

  /**
   * Handle token expiration events.
   */
  useEffect(() => {
    const handleTokenExpired = (event: CustomEvent) => {
      console.log("Received token expired event:", event.detail);
      handleSessionExpired();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokenExpired', handleTokenExpired as EventListener);
      return () => {
        window.removeEventListener('tokenExpired', handleTokenExpired as EventListener);
      };
    }
  }, []);

    const handleSessionExpired = async () => {
    if (isLoggingOut) {
      console.log("Logout already in progress, skipping session expiry handling...");
      return;
    }
    
    console.log("Session expired, clearing context and reloading page...");
    setIsLoggingOut(true);
    
    try {
      sessionManager.clearSession();
      sessionManager.stopSessionCheck();
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["session"] });
      if (typeof window !== 'undefined') {
        clearAuthData();
      }

      toast({
        type: "warning",
        title: "Session Expired",
        description: "Your session has expired. Page will reload...",
        duration: 2000
      });
      
      setTimeout(() => {
        console.log("Reloading page to reset authentication state...");
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error("Error during session expiration cleanup:", error);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  useEffect(() => {
    if (isLoading || isLoggingOut || hasRedirected) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const currentPath = window.location.pathname;
      const isOnAuthPage = isAuthRoute(currentPath);
      const isOnProtectedRoute = isProtectedRoute(currentPath);

      console.log("Auth redirect check:", {
        currentPath,
        isAuthenticated,
        isOnAuthPage,
        isOnProtectedRoute,
        isLoading,
        isLoggingOut,
        hasRedirected
      });

      if (!isAuthenticated && isOnProtectedRoute) {
        console.log("Redirecting to login - not authenticated on protected route");
        setHasRedirected(true);
        clearAuthData();
        window.location.replace("/login");
      } else if (isAuthenticated && isOnAuthPage) {
        console.log("Redirecting to dashboard - authenticated on auth page");
        setHasRedirected(true);
        window.location.replace("/dashboard");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
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
      console.log("Starting login process...");
      const result = await loginMutation.mutateAsync(credentials);
      
      // Set session info from login response
      if (result?.session) {
        sessionManager.setSessionInfo(result.session);
      }
      
      console.log("Login successful, invalidating queries and redirecting...");
      // Invalidate the user query to trigger a refetch naturally
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      console.log("Redirecting to dashboard...");
      setHasRedirected(true); // Prevent the redirect useEffect from running
      
      // Small delay to allow query invalidation to process
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 100);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (isLoggingOut || hasRedirected) {
      console.log("Logout already in progress, skipping manual logout...");
      return;
    }
    
    console.log("Manual logout initiated...");
    setIsLoggingOut(true);
    setHasRedirected(true);
    
    try {
      sessionManager.stopSessionCheck();
      sessionManager.clearSession();
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.clear();
      if (typeof window !== 'undefined') {
        clearAuthData();
      }
      await logoutMutation.mutateAsync();
      toast({
        type: "success",
        title: "Logged Out",
        description: "You have been successfully logged out.",
        duration: 2000
      });
      setTimeout(() => {
        window.location.replace("/login");
      }, 500);
      
    } catch (error) {
      console.error("Logout error:", error);
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      window.location.replace("/login");
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
