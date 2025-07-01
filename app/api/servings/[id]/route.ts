import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { withApiTimeout } from "@/lib/api-timeout";

interface JWTPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
}

async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, username: true },
    });
    return user;
  } catch {
    return null;
  }
}

async function handleDeleteServing(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only farm managers can delete serving records
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Serving ID is required" },
        { status: 400 }
      );
    }

    // Check if serving exists
    const existingServing = await prisma.serving.findUnique({
      where: { id },
    });

    if (!existingServing) {
      return NextResponse.json(
        { error: "Serving record not found" },
        { status: 404 }
      );
    }

    // Delete the serving record
    await prisma.serving.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Serving record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting serving record:", error);
    return NextResponse.json(
      { error: "Failed to delete serving record" },
      { status: 500 }
    );
  }
}

async function handleGetServing(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Serving ID is required" },
        { status: 400 }
      );
    }

    // Get the serving record
    const serving = await prisma.serving.findUnique({
      where: { id },
      include: {
        female: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
          },
        },
        servedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!serving) {
      return NextResponse.json(
        { error: "Serving record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ serving }, { status: 200 });
  } catch (error) {
    console.error("Error fetching serving record:", error);
    return NextResponse.json(
      { error: "Failed to fetch serving record" },
      { status: 500 }
    );
  }
}

// Export wrapped handlers with timeout
export const DELETE = withApiTimeout(handleDeleteServing, 30000);
export const GET = withApiTimeout(handleGetServing, 30000);
