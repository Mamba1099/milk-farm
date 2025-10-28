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
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const treatmentData = await prisma.treatment.findMany({
      where: {
        treatedAt: {
          gte: startOfYear,
          lte: endOfYear,
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

    const monthsInYear = [];
    for (let month = 0; month <= now.getMonth(); month++) {
      const currentMonth = new Date(now.getFullYear(), month, 1);
      monthsInYear.push({
        monthKey: currentMonth.toISOString().slice(0, 7),
        month: currentMonth.toLocaleDateString('en-US', { 
          month: 'short' 
        }),
        totalCost: 0,
        totalTreatments: 0,
        averageCost: 0,
        diseases: new Set(),
        medicines: new Set(),
      });
    }

    const monthlyData = new Map();
    monthsInYear.forEach(monthData => {
      monthlyData.set(monthData.monthKey, monthData);
    });

    treatmentData.forEach(treatment => {
      const monthKey = treatment.treatedAt.toISOString().slice(0, 7);
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        monthData.totalCost += treatment.cost;
        monthData.totalTreatments += 1;
        monthData.diseases.add(treatment.disease);
        monthData.medicines.add(treatment.medicine);
      }
    });

    const data = Array.from(monthlyData.values()).map(item => ({
      month: item.month,
      totalCost: Math.round(item.totalCost * 100) / 100,
      totalTreatments: item.totalTreatments,
      averageCost: item.totalTreatments > 0 ? Math.round((item.totalCost / item.totalTreatments) * 100) / 100 : 0,
      uniqueDiseases: item.diseases.size,
      uniqueMedicines: item.medicines.size,
    }));

    return createSecureResponse(data, { status: 200 }, request);
  } catch (error) {
    console.error("Error fetching treatment cost trends:", error);
    return createSecureErrorResponse("Failed to fetch treatment cost trends", 500, request);
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