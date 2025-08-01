"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRouteProps, RoleGuardProps } from "@/lib/types";
import { RingLoader } from "react-spinners";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallbackPath = "/login",
  showLoading = true,
}) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      if (requiredRoles && !hasRole(requiredRoles)) {
        router.push("/dashboard");
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    hasRole,
    requiredRoles,
    router,
    fallbackPath,
    user?.role,
  ]);

  if (isLoading) {
    if (!showLoading) return null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <RingLoader color="#2d5523" size={60} />
          </div>
          <p className="text-[#4a6b3d] text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
};

export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    requiredRoles?: string | string[];
    fallbackPath?: string;
  }
) {
  const AuthenticatedComponent = (props: T) => {
    return (
      <ProtectedRoute
        requiredRoles={options?.requiredRoles}
        fallbackPath={options?.fallbackPath}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;

  return AuthenticatedComponent;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRoles,
  fallback = null,
}) => {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated || !hasRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
