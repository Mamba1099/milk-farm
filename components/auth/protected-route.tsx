"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRouteProps, RoleGuardProps } from "@/lib/types";
import { RingLoader } from "react-spinners";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  showLoading = true,
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

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

  // Auth context handles authentication redirects globally, so we only need to handle role-based access
  if (isAuthenticated && requiredRoles && !hasRole(requiredRoles)) {
    router.replace("/dashboard");
    return null;
  }

  // Auth context will redirect if not authenticated, so we can safely render children
  return <>{children}</>;
};

export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    requiredRoles?: string | string[];
  }
) {
  const AuthenticatedComponent = (props: T) => {
    return (
      <ProtectedRoute requiredRoles={options?.requiredRoles}>
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
