import { NextRequest } from "next/server";
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
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const diseaseStats = await prisma.treatment.groupBy({
      by: ['disease'],
      _count: { disease: true },
      _sum: { cost: true },
      _avg: { cost: true },
      orderBy: { _count: { disease: 'desc' } }
    });

    const totalTreatments = diseaseStats.reduce((sum, stat) => sum + stat._count.disease, 0);
    const totalCost = diseaseStats.reduce((sum, stat) => sum + (stat._sum.cost || 0), 0);
    const averageCostPerTreatment = totalTreatments > 0 ? totalCost / totalTreatments : 0;
    
    const mostCommonDisease = diseaseStats.length > 0 ? diseaseStats[0] : null;
    const mostExpensiveDisease = diseaseStats.reduce((max, current) => 
      (current._sum.cost || 0) > (max._sum.cost || 0) ? current : max, 
      diseaseStats[0] || null
    );

    return createSecureResponse({
      summary: {
        totalTreatments,
        totalCost,
        averageCostPerTreatment,
        mostCommonDisease: mostCommonDisease ? {
          disease: mostCommonDisease.disease,
          count: mostCommonDisease._count.disease,
        } : null,
        mostExpensiveDisease: mostExpensiveDisease ? {
          disease: mostExpensiveDisease.disease,
          totalCost: mostExpensiveDisease._sum.cost || 0,
        } : null,
      },
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error fetching treatment statistics:", error);
    return createSecureErrorResponse("Failed to fetch treatment statistics", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
