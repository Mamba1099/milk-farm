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

    // Get today's date in UTC
    const today = new Date();
    
    // Get morning total including yesterday's balance
    const morningTotalWithBalance = await getMorningTotalWithBalance(today);

    return createSecureResponse(
      { 
        morningTotalWithBalance,
        date: today.toISOString().split('T')[0] 
      }, 
      {}, 
      request
    );

  } catch (error) {
    console.error("Error fetching morning total with balance:", error);
    return createSecureErrorResponse("Failed to fetch morning total with balance", 500, request);
  }
}