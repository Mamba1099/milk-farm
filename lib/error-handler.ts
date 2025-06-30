import { NextResponse } from "next/server";
import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Client-side error handler for API responses
export function handleApiError(error: unknown): ApiError {
  console.error("API Error:", error);

  // Handle Axios errors (most common)
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error || error.message || "Network error occurred";

    return {
      message: getUserFriendlyMessage(message, status),
      status,
      code: error.code,
    };
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message:
        "Unable to connect to the server. Please check your internet connection.",
      status: 0,
    };
  }

  // Handle regular errors
  if (error instanceof Error) {
    return {
      message: getUserFriendlyMessage(error.message, 500),
      status: 500,
    };
  }

  // Handle unknown errors
  return {
    message: "An unexpected error occurred. Please try again.",
    status: 500,
  };
}

// Convert technical error messages to user-friendly ones
function getUserFriendlyMessage(message: string, status: number): string {
  // Network/connection errors
  if (
    status === 0 ||
    message.includes("Network Error") ||
    message.includes("ECONNREFUSED")
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Authentication errors
  if (status === 401) {
    if (message.includes("token")) {
      return "Your session has expired. Please log in again.";
    }
    return "You are not authorized to perform this action. Please log in.";
  }

  // Permission errors
  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  // Not found errors
  if (status === 404) {
    return "The requested resource could not be found.";
  }

  // Validation errors (400 Bad Request)
  if (status === 400) {
    // Keep specific validation messages as they are user-friendly
    if (
      message.includes("Password must") ||
      message.includes("Username") ||
      message.includes("Email") ||
      message.includes("already exists") ||
      message.includes("not found") ||
      message.includes("cannot be") ||
      message.includes("invalid") ||
      message.includes("required")
    ) {
      return message;
    }
    return "Please check your input and try again.";
  }

  // Conflict errors
  if (status === 409) {
    if (message.includes("already exists")) {
      return message;
    }
    return "This action conflicts with existing data. Please refresh and try again.";
  }

  // Server errors
  if (status >= 500) {
    return "Server error occurred. Please try again later or contact support if the problem persists.";
  }

  // Rate limiting
  if (status === 429) {
    return "Too many requests. Please wait a moment before trying again.";
  }

  // Return the original message if it's already user-friendly
  return message;
}

// Server-side error handler for API routes
export function handleError(error: unknown) {
  console.error("API Error:", error);

  let status = 500;
  let message = "Internal server error";

  if (error instanceof Error) {
    if (error.name === "ValidationError") {
      status = 400;
      message = error.message;
    } else if (error.name === "UnauthorizedError") {
      status = 401;
      message = "Unauthorized";
    } else if (error.name === "ForbiddenError") {
      status = 403;
      message = "Forbidden";
    } else if (error.name === "NotFoundError") {
      status = 404;
      message = "Not found";
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    },
    { status }
  );
}

// Utility function to create standardized API responses
export function createApiResponse(data: unknown, message = "Success") {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

export function createApiError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
