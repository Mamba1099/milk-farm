import { NextRequest } from "next/server";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { calculateDayBalance, updateDaySummary, addBalanceToMorningProduction } from "@/lib/services/production-balance";

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
    
    const dayBalance = await calculateDayBalance(targetDate);
    
    await updateDaySummary(targetDate);
    const carryoverResult = await addBalanceToMorningProduction(targetDate);
    
    let message = "Day-end summary calculated successfully";
    if (carryoverResult.success && carryoverResult.balanceAdded > 0) {
      message += `. ${carryoverResult.balanceAdded}L carried over to next day's morning production`;
    } else if (!carryoverResult.success) {
      message += `. Warning: ${carryoverResult.message}`;
    }
    
    return createSecureResponse({
      message,
      summary: {
        date: dayBalance.date,
        totalProduction: dayBalance.totalProduction,
        totalCalfFed: dayBalance.totalCalfFed,
        netProduction: dayBalance.netProduction,
        totalSales: dayBalance.totalSales,
        balanceYesterday: dayBalance.balanceYesterday,
        finalBalance: dayBalance.finalBalance,
        carryoverResult: carryoverResult
      }
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error calculating day-end summary:", error);
    return createSecureErrorResponse("Failed to calculate day-end summary", 500, request);
  }
}