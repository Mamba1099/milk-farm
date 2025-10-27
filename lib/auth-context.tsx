"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useLogoutMutation } from "@/hooks/use-user-queries";
import { useLoginMutation } from "@/hooks/use-login";
import { useToast } from "@/hooks/use-toast";
import { LoginInput, AuthContextType, AuthProviderProps } from "@/lib/types";
import { clearAuthData } from "@/lib/auth-utils";
import { setGlobalToast } from "@/lib/toast-manager";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Register toast function globally for API client use
  useEffect(() => {
    setGlobalToast(toast);
  }, [toast]);

  const {
    data: user,
    isLoading,
    error: userError,
    refetch: authCheck,
  } = useCurrentUser();
  
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const isAuthenticated = !!user && !userError;
  const isFarmManager = user?.role === "FARM_MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";
  const canEdit = isFarmManager;
  const canView = isAuthenticated;

  const login = async (credentials: LoginInput) => {
    try {
      await loginMutation.mutateAsync(credentials);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (isLoggingOut) return;
    handleLogout();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      queryClient.clear();
      const isCleared = await clearAuthData();
      
      if (isCleared) {
        toast({
          type: "success",
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      } else {
        await logoutMutation.mutateAsync();
        toast({
          type: "success", 
          title: "Logged Out",
          description: "You have been logged out.",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    } finally {
      setIsLoggingOut(false);
      router.replace("/login");
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isFarmManager,
    isEmployee,
    login,
    logout,
    authCheck,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
