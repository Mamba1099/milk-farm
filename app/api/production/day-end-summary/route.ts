import { NextRequest } from "next/server";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { calculateDayBalance, updateDaySummary } from "@/lib/services/production-balance";

export async function POST(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) return securityError;

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return createSecureErrorResponse("Date is required", 400, request);
    }

    const targetDate = new Date(date);
    
    // Calculate the day's balance
    const dayBalance = await calculateDayBalance(targetDate);
    
    // Update the summary in database
    await updateDaySummary(targetDate);
    
    return createSecureResponse({
      message: "Day-end summary calculated successfully",
      summary: {
        date: dayBalance.date,
        totalProduction: dayBalance.totalProduction,
        totalCalfFed: dayBalance.totalCalfFed,
        netProduction: dayBalance.netProduction,
        totalSales: dayBalance.totalSales,
        balanceYesterday: dayBalance.balanceYesterday,
        finalBalance: dayBalance.finalBalance,
      }
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error calculating day-end summary:", error);
    return createSecureErrorResponse("Failed to calculate day-end summary", 500, request);
  }
}