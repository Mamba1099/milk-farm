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
    if (!user || !["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const [
      total,
      pending,
      successful,
      failed,
      predeterminedOva,
      normalOva,
    ] = await Promise.all([
      prisma.serving.count(),
      prisma.serving.count({ where: { outcome: "PENDING" } }),
      prisma.serving.count({ where: { outcome: "SUCCESSFUL" } }),
      prisma.serving.count({ where: { outcome: "FAILED" } }),
      prisma.serving.count({ where: { ovaType: "PREDETERMINED" } }),
      prisma.serving.count({ where: { ovaType: "NORMAL" } }),
    ]);

    const stats = {
      total,
      pending,
      successful,
      failed,
      predeterminedOva,
      normalOva,
    };

    return createSecureResponse(stats, {}, request);
  } catch (error) {
    console.error("Error fetching serving stats:", error);
    return createSecureErrorResponse("Failed to fetch serving statistics", 500, request);
  }
}
