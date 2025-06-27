"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string | string[];
  fallbackPath?: string;
  showLoading?: boolean;
}

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
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      // If roles are required and user doesn't have them, redirect
      if (requiredRoles && !hasRole(requiredRoles)) {
        // Redirect to dashboard for all users
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

  // Show loading state
  if (isLoading) {
    if (!showLoading) return null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If roles are required and user doesn't have them, don't render children
  if (requiredRoles && !hasRole(requiredRoles)) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// Higher-order component for protecting pages
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

// Role-based access control component
interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string | string[];
  fallback?: ReactNode;
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
