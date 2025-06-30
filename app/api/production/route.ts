import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productionSchema } from "@/lib/validators/animal";
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

// GET /api/production - Get production records with pagination and filters
async function GET_handler(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filter parameters
    const animalId = searchParams.get("animalId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: {
      animalId?: string;
      date?: {
        gte?: Date;
        lt?: Date;
        lte?: Date;
      };
    } = {};

    if (animalId) {
      where.animalId = animalId;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      where.date = {
        gte: startOfDay,
        lt: endOfDay,
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get production records with related data
    const [productions, total] = await Promise.all([
      prisma.production.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          date: "desc",
        },
        include: {
          animal: {
            select: {
              id: true,
              tagNumber: true,
              name: true,
              type: true,
              image: true,
            },
          },
          recordedBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      prisma.production.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      productions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching production records:", error);
    return NextResponse.json(
      { error: "Failed to fetch production records" },
      { status: 500 }
    );
  }
}

// POST /api/production - Create new production record
async function POST_handler(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (Farm Manager or Employee)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate request body
    const validation = productionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      animalId,
      date,
      morningQuantity,
      eveningQuantity,
      calfQuantity,
      poshoQuantity,
      notes,
    } = validation.data;

    // Check if animal exists and is ready for production
    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    if (!animal.isReadyForProduction) {
      return NextResponse.json(
        { error: "Animal is not ready for production" },
        { status: 400 }
      );
    }

    // Check if production record already exists for this animal on this date
    const targetDate = new Date(date);
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const existingRecord = await prisma.production.findFirst({
      where: {
        animalId,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error:
            "Production record already exists for this animal on this date",
        },
        { status: 409 }
      );
    }

    // Calculate totals
    const totalQuantity = morningQuantity + eveningQuantity;
    const totalDeductions = calfQuantity + poshoQuantity;
    const availableForSales = Math.max(0, totalQuantity - totalDeductions);

    // Create production record
    const production = await prisma.production.create({
      data: {
        animalId,
        date: new Date(date),
        morningQuantity,
        eveningQuantity,
        totalQuantity,
        calfQuantity,
        poshoQuantity,
        availableForSales,
        carryOverQuantity: 0, // Will be updated by carry-over logic
        recordedById: user.id,
        notes,
      },
      include: {
        animal: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
            type: true,
            image: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Production record created successfully",
      production,
    });
  } catch (error) {
    console.error("Error creating production record:", error);
    return NextResponse.json(
      { error: "Failed to create production record" },
      { status: 500 }
    );
  }
}

// PUT /api/production/[id] - Update production record
async function PUT_handler(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Farm Manager
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Production ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = productionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      morningQuantity,
      eveningQuantity,
      calfQuantity,
      poshoQuantity,
      notes,
    } = validation.data;

    // Check if production record exists
    const existingRecord = await prisma.production.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Production record not found" },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalQuantity = morningQuantity + eveningQuantity;
    const totalDeductions = calfQuantity + poshoQuantity;
    const availableForSales = Math.max(0, totalQuantity - totalDeductions);

    // Update production record
    const production = await prisma.production.update({
      where: { id },
      data: {
        morningQuantity,
        eveningQuantity,
        totalQuantity,
        calfQuantity,
        poshoQuantity,
        availableForSales,
        notes,
        updatedAt: new Date(),
      },
      include: {
        animal: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
            type: true,
            image: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Production record updated successfully",
      production,
    });
  } catch (error) {
    console.error("Error updating production record:", error);
    return NextResponse.json(
      { error: "Failed to update production record" },
      { status: 500 }
    );
  }
}

// DELETE /api/production/[id] - Delete production record
async function DELETE_handler(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Farm Manager
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Production ID is required" },
        { status: 400 }
      );
    }

    // Check if production record exists
    const existingRecord = await prisma.production.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Production record not found" },
        { status: 404 }
      );
    }

    // Delete production record
    await prisma.production.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Production record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting production record:", error);
    return NextResponse.json(
      { error: "Failed to delete production record" },
      { status: 500 }
    );
  }
}

// Export handlers with timeout middleware
export const GET = withApiTimeout(GET_handler, 30000);
export const POST = withApiTimeout(POST_handler, 30000);
export const PUT = withApiTimeout(PUT_handler, 30000);
export const DELETE = withApiTimeout(DELETE_handler, 30000);
