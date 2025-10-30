import { NextRequest } from "next/server";
import { getUserFromSession } from "@/lib/auth-session";
import { createSecureResponse, createSecureErrorResponse, validateSecurity } from "@/lib/security";
import { getMorningTotalWithBalance } from "@/lib/services/production-balance";

export async function GET(request: NextRequest) {
  try {
    // Security validation
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }

    // Authentication check
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    // Get date from query param, fallback to today
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    let date: Date;
    if (dateParam) {
      date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return createSecureErrorResponse("Invalid date format", 400, request);
      }
    } else {
      date = new Date();
    }

    const morningTotalWithBalance = await getMorningTotalWithBalance(date);

    return createSecureResponse(
      { 
        morningTotalWithBalance,
        date: date.toISOString().split('T')[0] 
      }, 
      {}, 
      request
    );

  } catch (error) {
    console.error("Error fetching morning total with balance:", error);
    return createSecureErrorResponse("Failed to fetch morning total with balance", 500, request);
  }
}