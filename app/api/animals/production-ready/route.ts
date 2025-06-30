import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
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

// GET /api/animals/production-ready - Get animals ready for production
async function handleGetProductionReadyAnimals(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get animals that are ready for production
    const animals = await prisma.animal.findMany({
      where: {
        isReadyForProduction: true,
        type: "COW",
        gender: "FEMALE",
        disposals: {
          none: {},
        },
      },
      select: {
        id: true,
        tagNumber: true,
        name: true,
        type: true,
        gender: true,
        birthDate: true,
        expectedMaturityDate: true,
        image: true,
        isMatured: true,
        isReadyForProduction: true,
        motherOf: {
          where: {
            type: "CALF",
            disposals: {
              none: {},
            },
          },
          select: {
            id: true,
            tagNumber: true,
            name: true,
            birthDate: true,
            image: true,
          },
        },
      },
      orderBy: {
        tagNumber: "asc",
      },
    });

    return NextResponse.json({
      animals,
      total: animals.length,
    });
  } catch (error) {
    console.error("Error fetching production-ready animals:", error);
    return NextResponse.json(
      { error: "Failed to fetch production-ready animals" },
      { status: 500 }
    );
  }
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetProductionReadyAnimals, 20000);
