import { NextRequest, NextResponse } from "next/server";
import {
  updateAnimalMaturityStatus,
  updateProductionCarryOver,
} from "@/lib/animal-maturity";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { withApiTimeout } from "@/lib/api-timeout";

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      username: string;
      email: string;
      role: string;
      image: string | null;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, username: true },
    });
    return user;
  } catch {
    return null;
  }
}

// POST /api/system/update-maturity - Update animal maturity status
async function handleUpdateMaturity(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only farm managers can run system operations
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const operation = body.operation;

    let result;
    switch (operation) {
      case "maturity":
        result = await updateAnimalMaturityStatus();
        break;
      case "carry-over":
        result = await updateProductionCarryOver();
        break;
      case "both":
        const maturityResult = await updateAnimalMaturityStatus();
        const carryOverResult = await updateProductionCarryOver();
        result = {
          maturity: maturityResult,
          carryOver: carryOverResult,
        };
        break;
      default:
        return NextResponse.json(
          {
            error: "Invalid operation. Use 'maturity', 'carry-over', or 'both'",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: "System update completed successfully",
      result,
    });
  } catch (error) {
    console.error("Error running system update:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to run system update";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Export wrapped handlers with timeout
export const POST = withApiTimeout(handleUpdateMaturity, 60000); // 60 seconds timeout for system operations
