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
    const servingOutcomes = await prisma.serving.groupBy({
      by: ['outcome'],
      _count: {
        id: true,
      },
    });

    const totalServings = servingOutcomes.reduce((sum, outcome) => sum + outcome._count.id, 0);

    const allOutcomes = ['SUCCESSFUL', 'FAILED', 'PENDING'] as const;
    const data = allOutcomes.map(outcomeType => {
      const found = servingOutcomes.find(outcome => outcome.outcome === outcomeType);
      const count = found?._count.id || 0;
      return {
        outcome: outcomeType,
        count,
        percentage: totalServings > 0 ? (count / totalServings) * 100 : 0,
      };
    });

    return createSecureResponse(data, { status: 200 }, request);
  } catch (error) {
    console.error("Error fetching serving outcomes:", error);
    return createSecureErrorResponse("Failed to fetch serving outcomes", 500, request);
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