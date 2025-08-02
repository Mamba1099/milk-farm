"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { AuthErrorBoundaryProps, AuthErrorBoundaryState } from "@/lib/types";

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    const isAuthError =
      error.message.includes("401") ||
      error.message.includes("403") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("token") ||
      error.message.includes("session");

    return {
      hasError: true,
      error,
      isAuthError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);

    if (this.state.isAuthError) {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      window.dispatchEvent(
        new CustomEvent("tokenExpired", {
          detail: { message: "Authentication error. Please log in again." },
        })
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isAuthError) {
        return <AuthErrorFallback />;
      }

      return (
        <GeneralErrorFallback
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

const AuthErrorFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-red-500">
            <Icons.alertCircle className="h-full w-full" />
          </div>
          <CardTitle className="text-red-700">Session Expired</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your session has expired. You will be redirected to the login page
            automatically.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        </CardContent>
      </Card>
    </div>
  );
};

const GeneralErrorFallback: React.FC<{ onRetry: () => void }> = ({
  onRetry,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-gray-500">
            <Icons.alertCircle className="h-full w-full" />
          </div>
          <CardTitle className="text-gray-700">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            An unexpected error occurred. Please try again.
          </p>
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
