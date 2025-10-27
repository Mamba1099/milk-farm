import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
    const securityError = validateSecurity(request);
    if (securityError) return securityError;

  const user = await getUserFromSession(request);
  if (!user) {
    return createSecureErrorResponse("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let where: any = {};
    if (date) {
      const dayStart = new Date(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.createdAt = {
        gte: dayStart,
        lt: dayEnd,
      };
    } else if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lt: new Date(endDate),
      };
    }

    const summaries = await prisma.productionSummary.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (date) {
      return createSecureResponse({ data: summaries[0] || null });
    } else {
      return createSecureResponse({ data: summaries });
    }
  } catch (error) {
    console.error("Error fetching production summary:", error);
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : "Internal Server Error";
    return createSecureErrorResponse(errorMessage, 500);
  }
}   
