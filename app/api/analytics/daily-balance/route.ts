import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
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

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

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

    const summaryMap = new Map();
    productionSummaries.forEach(summary => {
      const day = summary.date.getUTCDate();
      summaryMap.set(day, summary);
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month - 1, day));
      const existingSummary = summaryMap.get(day);
      
      let finalBalance = 0;
      
      if (existingSummary) {
        finalBalance = existingSummary.final_balance;
      } else {
        const today = new Date();
        const isFuture = date > today;
        
        if (isFuture) {
          finalBalance = 0;
        } else {
          finalBalance = 0;
        }
      }
      
      dailyBalanceData.push({
        date: date.toISOString().split('T')[0],
        balance: finalBalance,
        day: day,
      });
    }

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