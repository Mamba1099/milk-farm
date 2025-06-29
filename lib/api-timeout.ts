import { NextResponse } from "next/server";

/**
 * API Request timeout configuration
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Wraps an async function with timeout handling
 * @param fn - The async function to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 30 seconds)
 * @returns Promise that resolves with the function result or rejects with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = API_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([fn(), timeoutPromise]);
}

/**
 * Creates a timeout error response
 * @param message - Custom timeout message
 * @returns NextResponse with timeout error
 */
export function createTimeoutResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: message || "Request timeout",
      code: "TIMEOUT",
      timestamp: new Date().toISOString(),
    },
    { status: 408 }
  );
}

/**
 * Wraps API route handler with timeout and error handling
 * @param handler - The API route handler function
 * @param timeoutMs - Timeout in milliseconds
 * @returns Wrapped handler with timeout protection
 */
export function withApiTimeout<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  timeoutMs: number = API_TIMEOUT
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await withTimeout(() => handler(...args), timeoutMs);
    } catch (error) {
      console.error("API timeout or error:", error);

      if (error instanceof Error && error.message.includes("timeout")) {
        return createTimeoutResponse();
      }

      // Re-throw non-timeout errors to be handled by the original handler
      throw error;
    }
  };
}
