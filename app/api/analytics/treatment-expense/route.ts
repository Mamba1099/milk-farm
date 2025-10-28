import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
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
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const treatmentExpenses = await prisma.treatment.findMany({
      where: {
        treatedAt: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      select: {
        cost: true,
        treatedAt: true,
        disease: true,
        medicine: true,
      },
      orderBy: {
        treatedAt: 'asc',
      },
    });

    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, i, 1);
      const monthKey = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      return {
        key: monthKey,
        month: monthName,
        totalCost: 0,
        treatmentCount: 0,
        avgCost: 0,
      };
    });

    const monthlyExpensesMap = treatmentExpenses.reduce((acc: any, treatment) => {
      const month = treatment.treatedAt.toISOString().slice(0, 7);

      if (!acc[month]) {
        acc[month] = {
          totalCost: 0,
          treatmentCount: 0,
        };
      }

      acc[month].totalCost += treatment.cost;
      acc[month].treatmentCount += 1;

      return acc;
    }, {});

    const monthlyExpenses = allMonths.map(monthTemplate => {
      const actualData = monthlyExpensesMap[monthTemplate.key];
      
      if (actualData) {
        return {
          month: monthTemplate.month,
          totalCost: Math.round(actualData.totalCost * 100) / 100,
          treatmentCount: actualData.treatmentCount,
          avgCost: actualData.treatmentCount > 0 ? 
            Math.round((actualData.totalCost / actualData.treatmentCount) * 100) / 100 : 0,
        };
      }
      
      return monthTemplate;
    });

    return createSecureResponse(monthlyExpenses, { status: 200 }, request);
  } catch (error) {
    console.error("Error fetching treatment expenses:", error);
    return createSecureErrorResponse("Failed to fetch treatment expenses", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }
  return createSecureResponse(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
    request
  );
}