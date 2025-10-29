import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  console.log('Daily balance API called');
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    console.log(`Fetching daily balance for month: ${month}, year: ${year}`);

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    // Get production summaries - only show data from completed days (where day-end summary was triggered)
    const productionSummaries = await prisma.productionSummary.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        final_balance: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyBalanceData = [];

    console.log(`=== DAILY BALANCE FROM SUMMARY TABLE ===`);
    console.log(`Found ${productionSummaries.length} production summaries for ${daysInMonth} days in ${year}-${month}`);

    // Create a map of existing summaries
    const summaryMap = new Map();
    productionSummaries.forEach(summary => {
      const day = summary.date.getUTCDate();
      summaryMap.set(day, summary);
      console.log(`Day ${day}: Final Balance = ${summary.final_balance}L (from ProductionSummary)`);
    });

    // Generate data for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month - 1, day));
      const existingSummary = summaryMap.get(day);
      
      let finalBalance = 0;
      
      if (existingSummary) {
        // Use the final_balance from ProductionSummary table (calculated when day-end summary was triggered)
        finalBalance = existingSummary.final_balance;
        console.log(`Day ${day}: Using summary balance = ${finalBalance}L`);
      } else {
        // No summary exists - this means day-end summary hasn't been triggered for this day
        // For future days or days without summary, show 0 balance
        const today = new Date();
        const isFuture = date > today;
        
        if (isFuture) {
          finalBalance = 0;
          console.log(`Day ${day}: Future date - balance = 0L`);
        } else {
          // Past day without summary - could be a day with no activity or summary not triggered
          finalBalance = 0;
          console.log(`Day ${day}: Past date without summary - balance = 0L`);
        }
      }
      
      dailyBalanceData.push({
        date: date.toISOString().split('T')[0],
        balance: finalBalance,
        day: day,
      });
    }

    console.log(`=== FINAL DAILY BALANCE DATA ===`);
    console.log(JSON.stringify(dailyBalanceData, null, 2));
    console.log(`=====================================`);

    const response = {
      success: true,
      data: dailyBalanceData,
      month,
      year,
      totalDays: dailyBalanceData.length,
    };

    return createSecureResponse(response, {}, request);

  } catch (error) {
    console.error("Error in daily balance API:", error);
    return createSecureErrorResponse(
      error instanceof Error ? error.message : "Failed to fetch daily balance data", 
      500, 
      request
    );
  }
}