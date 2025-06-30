"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { isTokenExpired } from "@/lib/jwt-utils";

// Hook to automatically check token expiration
export const useTokenExpiration = () => {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");

      if (token && isTokenExpired(token)) {
        // Clear expired token
        localStorage.removeItem("token");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Show expiration message
        toast({
          type: "error",
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
        });

        // Redirect to login
        router.push("/login");
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    // Listen for focus events to check when user returns to tab
    const handleFocus = () => {
      checkTokenExpiration();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router, toast]);
};

// Hook to listen for custom token expiration events
export const useAuthErrorHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleTokenExpired = (event: CustomEvent) => {
      toast({
        type: "error",
        title: "Session Expired",
        description:
          event.detail?.message ||
          "Your session has expired. Please log in again.",
      });
    };

    const handleAuthError = (event: CustomEvent) => {
      toast({
        type: "error",
        title: "Authentication Error",
        description:
          event.detail?.message || "An authentication error occurred.",
      });
    };

    window.addEventListener(
      "tokenExpired",
      handleTokenExpired as EventListener
    );
    window.addEventListener("authError", handleAuthError as EventListener);

    return () => {
      window.removeEventListener(
        "tokenExpired",
        handleTokenExpired as EventListener
      );
      window.removeEventListener("authError", handleAuthError as EventListener);
    };
  }, [toast]);
};
