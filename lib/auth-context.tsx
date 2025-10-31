"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/use-login";
import { useLogout } from "@/hooks/use-logout";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { jwtDecode } from "jwt-decode";
import { toast } from "@/components/ui/sonner";
import type { TokenPayload, AuthUser, AuthContextType, LoginInput } from "@/lib/types/auth";

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  // toast from sonner

  const handleSessionExpiry = useCallback(() => {
    toast.warning("Your session has expired. Please log in again.");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userName");
    setUser(null);
    setError(null);
    router.push("/login");
  }, [router, toast]);

  const updateAuthState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = sessionStorage.getItem("accessToken");
      const refreshToken = sessionStorage.getItem("refreshToken");
      const name = sessionStorage.getItem("userName");

      if (accessToken) {
        const decoded = jwtDecode<TokenPayload>(accessToken);

        if (decoded.exp * 1000 < Date.now()) {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          sessionStorage.removeItem("userName");
          setUser(null);
          return;
        }
        setUser({
          id: decoded.sub,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role as "FARM_MANAGER" | "EMPLOYEE",
          name: name || decoded.username,
          phone: undefined,
          image: decoded.image || null,
          image_url: decoded.image_url || null,
          createdAt: decoded.createdAt || new Date().toISOString(),
          updatedAt: decoded.updatedAt || new Date().toISOString(),
        });
      } else {
        if (refreshToken) {
          sessionStorage.removeItem("refreshToken");
          sessionStorage.removeItem("userName");
        }
        setUser(null);
      }
    } catch (error) {
      console.error("Auth state update error:", error);
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userName");
      setUser(null);
      setError(error instanceof Error ? error : new Error("Auth error"));
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
      if (!isInitialized) setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  useEffect(() => {
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [updateAuthState]);

  const loginMutation = useLogin(updateAuthState);
  const logoutMutation = useLogout();
  const autoRefresh = useAutoRefresh();

  const clearError = () => setError(null);

  const clearAllAuthData = useCallback(() => {
    sessionStorage.clear();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // Expose setUser for instant update after profile edit
        login: async (data: LoginInput) => {
          try {
            clearError();
            const result = await loginMutation.mutateAsync(data);
            if (result && result.user && result.user.username) {
              sessionStorage.setItem("userName", result.user.username);
            }
            await updateAuthState();
            if (result && result.user && result.user.role === "FARM_MANAGER") {
              router.push("/dashboard");
            } else {
              router.push("/dashboard");
            }
          } catch (error) {
            const authError = error instanceof Error
              ? error
              : new Error("Login failed. Please check your credentials and try again.");
            setError(authError);
            throw authError;
          }
        },
        logout: async () => {
          try {
            clearError();
            sessionStorage.clear();
            setUser(null);
            if (user?.id) {
              try {
                await logoutMutation.mutateAsync(user.id);
              } catch (serverError) {
                console.warn(
                  "Server logout failed, but local logout successful:",
                  serverError
                );
              }
            }
            await updateAuthState();
            router.push("/login");
          } catch (error) {
            console.error("Logout error:", error);
            sessionStorage.clear();
            setUser(null);
            router.push("/login");
            setError(
              error instanceof Error ? error : new Error("Logout failed")
            );
          }
        },
        refreshToken: async () => {
          try {
            clearError();
            const refreshToken = sessionStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token found");
            await autoRefresh.mutateAsync({ refreshToken });
            await updateAuthState();
          } catch (error) {
            setError(
              error instanceof Error ? error : new Error("Token refresh failed")
            );
          }
        },
        isAuthenticated: !!user,
        isLoading,
        isInitialized,
        isLoggingIn: loginMutation.isPending,
        error,
        clearError,
        handleSessionExpiry,
        clearAllAuthData,
        hasRole: (roles: string | string[]): boolean => {
          if (!user) return false;
          const roleArray = Array.isArray(roles) ? roles : [roles];
          return roleArray.includes(user.role);
        },
        get isFarmManager(): boolean {
          return user?.role === "FARM_MANAGER";
        },
        get isEmployee(): boolean {
          return user?.role === "EMPLOYEE";
        },
        get canEdit(): boolean {
          return user?.role === "FARM_MANAGER";
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
