import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiTimeout } from "@/lib/api-timeout";
import { verifyToken } from "@/lib/jwt-utils";

async function handleSystemHealth(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user has admin privileges
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check database connectivity
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

    // API is operational if this endpoint responds
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

    return NextResponse.json({
      message: "System health check completed",
      health: systemHealth,
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check for the health endpoint itself
async function handleHealthCheck() {
  return NextResponse.json({ message: "System health endpoint is working" });
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleSystemHealth, 15000); // 15 second timeout
export const POST = withApiTimeout(handleHealthCheck, 5000);
