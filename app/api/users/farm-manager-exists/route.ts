import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateSecurity,
  createSecureResponse,
} from "@/lib/security";

export async function GET(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }

  try {
    const farmManager = await prisma.user.findFirst({
      where: {
        role: "FARM_MANAGER",
      },
      select: {
        id: true,
      },
    });

    return createSecureResponse(
      {
        exists: !!farmManager,
      },
      { status: 200 },
      request
    );
  } catch (error) {
    console.error("Error checking farm manager existence:", error);
    
    return createSecureResponse(
      {
        exists: false,
      },
      { status: 200 },
      request
    );
  }
}

export async function OPTIONS(request: NextRequest) {
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
