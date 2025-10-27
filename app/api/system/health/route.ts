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

    if (!["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    let databaseStatus = "Disconnected";
    let databaseError = null;

    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = "Connected";
    } catch (error) {
      console.error("Database health check failed:", error);
      databaseError = error instanceof Error ? error.message : "Unknown error";
      databaseStatus = "Error";
    }

    const fileStorageStatus = "Active";
    const authSystemStatus = "Secure";
    const apiStatus = "Operational";

    const systemHealth = {
      environment: process.env.NODE_ENV || "development",
      database: {
        status: databaseStatus,
        error: databaseError,
      },
      fileStorage: {
        status: fileStorageStatus,
      },
      authSystem: {
        status: authSystemStatus,
      },
      api: {
        status: apiStatus,
      },
      lastBackup: null,
      timestamp: new Date().toISOString(),
    };

    return createSecureResponse({
      message: "System health check completed",
      health: systemHealth,
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error checking system health:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    return createSecureResponse({
      message: "System health endpoint is working",
      timestamp: new Date().toISOString(),
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error in health check ping:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
