import { NextResponse } from "next/server";
import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export function handleApiError(error: unknown): ApiError {
  console.error("API Error:", error);

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

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message:
        "Unable to connect to the server. Please check your internet connection.",
      status: 0,
    };
  }

  if (error instanceof Error) {
    return {
      message: getUserFriendlyMessage(error.message, 500),
      status: 500,
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    status: 500,
  };
}

function getUserFriendlyMessage(message: string, status: number): string {
  if (
    status === 0 ||
    message.includes("Network Error") ||
    message.includes("ECONNREFUSED")
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (status === 401) {
    if (message.includes("token")) {
      return "Your session has expired. Please log in again.";
    }
    return "You are not authorized to perform this action. Please log in.";
  }

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource could not be found.";
  }

  if (status === 400) {
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

  if (status === 409) {
    if (message.includes("already exists")) {
      return message;
    }
    return "This action conflicts with existing data. Please refresh and try again.";
  }

  if (status >= 500) {
    return "Server error occurred. Please try again later or contact support if the problem persists.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment before trying again.";
  }

  return message;
}

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
