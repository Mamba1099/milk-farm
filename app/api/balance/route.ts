import { NextRequest } from "next/server";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { getAvailableMilkForSales, calculateDayBalance } from "@/lib/services/production-balance";

export async function GET(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) return securityError;

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const type = searchParams.get("type") || "current";

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    if (type === "available") {
      const availableMilk = await getAvailableMilkForSales(targetDate);
      
      // Debug logging for balance API
      console.log("=== BALANCE API DEBUG ===");
      console.log(`Target Date: ${targetDate.toISOString().split('T')[0]}`);
      console.log(`Available Milk Data:`, JSON.stringify(availableMilk, null, 2));
      console.log(`Balance Breakdown:`);
      console.log(`  - Carry Over (Yesterday): ${availableMilk.balanceYesterday}L`);
      console.log(`  - Today Production: ${availableMilk.todayNetProduction}L`);
      console.log(`  - Total Available: ${availableMilk.totalAvailable}L`);
      console.log(`  - Total Sold: ${availableMilk.totalSold}L`);
      console.log(`  - Current Balance: ${availableMilk.remainingBalance}L`);
      console.log("=========================");
      
      return createSecureResponse({ 
        availableMilk: {
          carryOver: availableMilk.balanceYesterday,
          todayProduction: availableMilk.todayNetProduction,
          totalAvailable: availableMilk.totalAvailable,
          totalSold: availableMilk.totalSold,
          currentBalance: availableMilk.remainingBalance,
        }
      }, { status: 200 }, request);
    }

    const dailyBalance = await calculateDayBalance(targetDate);
    return createSecureResponse({ dailyBalance }, { status: 200 }, request);

  } catch (error) {
    console.error("Error fetching balance:", error);
    return createSecureErrorResponse("Failed to fetch balance information", 500, request);
  }
}