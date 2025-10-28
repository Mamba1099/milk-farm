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
    const allServings = await prisma.serving.findMany({
      select: {
        servingType: true,
        outcome: true,
        ovaType: true,
        dateServed: true,
      },
    });

    if (allServings.length === 0) {
      return NextResponse.json([]);
    }

    const servingTypeStats = allServings.reduce((acc: any, serving) => {
      const type = serving.servingType;
      
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          successful: 0,
          failed: 0,
          pending: 0,
          predetermined: 0,
          normal: 0,
        };
      }

      acc[type].total += 1;
      
      if (serving.outcome === 'SUCCESSFUL') acc[type].successful += 1;
      else if (serving.outcome === 'FAILED') acc[type].failed += 1;
      else if (serving.outcome === 'PENDING') acc[type].pending += 1;

      if (serving.ovaType === 'PREDETERMINED') acc[type].predetermined += 1;
      else acc[type].normal += 1;

      return acc;
    }, {});

    const totalServings = allServings.length;
    const data = Object.entries(servingTypeStats).map(([type, stats]: [string, any]) => {
      const successRate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
      const percentage = totalServings > 0 ? (stats.total / totalServings) * 100 : 0;

      return {
        type,
        count: stats.total,
        successfulCount: stats.successful,
        failedCount: stats.failed,
        pendingCount: stats.pending,
        successRate: Math.round(successRate * 10) / 10,
        percentage: Math.round(percentage * 10) / 10,
        predeterminedCount: stats.predetermined,
        normalCount: stats.normal,
      };
    });

    return createSecureResponse(data, { status: 200 }, request);
  } catch (error) {
    console.error("Error fetching serving types:", error);
    return createSecureErrorResponse("Failed to fetch serving types", 500, request);
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