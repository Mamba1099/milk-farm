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

async function handleCreateServing(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only farm managers can create serving records
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      femaleId,
      maleId,
      servedAt,
      outcome = "PENDING",
      pregnancyDate,
      actualBirthDate,
      notes,
    } = body;

    // Validate required fields
    if (!femaleId) {
      return NextResponse.json(
        { error: "Female animal ID is required" },
        { status: 400 }
      );
    }

    if (!servedAt) {
      return NextResponse.json(
        { error: "Serving date is required" },
        { status: 400 }
      );
    }

    // Validate that femaleId exists and is a female animal
    const femaleAnimal = await prisma.animal.findUnique({
      where: { id: femaleId },
    });

    if (!femaleAnimal) {
      return NextResponse.json(
        { error: "Female animal not found" },
        { status: 404 }
      );
    }

    if (femaleAnimal.gender !== "FEMALE") {
      return NextResponse.json(
        { error: "Selected animal must be female" },
        { status: 400 }
      );
    }

    // Validate male animal if provided
    if (maleId) {
      const maleAnimal = await prisma.animal.findUnique({
        where: { id: maleId },
      });

      if (!maleAnimal) {
        return NextResponse.json(
          { error: "Male animal not found" },
          { status: 404 }
        );
      }

      if (maleAnimal.gender !== "MALE") {
        return NextResponse.json(
          { error: "Selected animal must be male" },
          { status: 400 }
        );
      }
    }

    // Validate outcome
    if (!["SUCCESSFUL", "FAILED", "PENDING"].includes(outcome)) {
      return NextResponse.json(
        { error: "Invalid outcome. Must be SUCCESSFUL, FAILED, or PENDING" },
        { status: 400 }
      );
    }

    // Create the serving record
    const serving = await prisma.serving.create({
      data: {
        femaleId,
        maleId: maleId || null,
        servedAt: new Date(servedAt),
        outcome,
        pregnancyDate: pregnancyDate ? new Date(pregnancyDate) : null,
        actualBirthDate: actualBirthDate ? new Date(actualBirthDate) : null,
        servedById: user.id,
        notes: notes || null,
      },
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

    return NextResponse.json({ serving }, { status: 201 });
  } catch (error) {
    console.error("Error creating serving record:", error);
    return NextResponse.json(
      { error: "Failed to create serving record" },
      { status: 500 }
    );
  }
}

async function handleGetServings(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const outcome = url.searchParams.get("outcome");
    const search = url.searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: unknown = {};

    if (outcome) {
      where.outcome = outcome;
    }

    if (search) {
      where.OR = [
        {
          female: {
            tagNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          female: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          notes: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Get servings with pagination
    const [servings, total] = await Promise.all([
      prisma.serving.findMany({
        where,
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
        orderBy: { servedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.serving.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      servings,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching servings:", error);
    return NextResponse.json(
      { error: "Failed to fetch servings" },
      { status: 500 }
    );
  }
}

// Export wrapped handlers with timeout
export const POST = withApiTimeout(handleCreateServing, 30000);
export const GET = withApiTimeout(handleGetServings, 30000);
