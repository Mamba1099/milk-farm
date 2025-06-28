import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateProductionSchema } from "@/lib/validators/animal";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
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

// GET /api/production - Get all production records with filtering
async function handleGetProduction(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get("animalId");
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.ProductionWhereInput = {};
    if (animalId) where.animalId = animalId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const productionRecords = await prisma.production.findMany({
      where,
      include: {
        animal: { select: { id: true, tagNumber: true, name: true } },
        recordedBy: { select: { id: true, username: true } },
      },
      skip,
      take: limit,
      orderBy: { date: "desc" },
    });

    const total = await prisma.production.count({ where });

    // Calculate summary statistics
    const summary = await prisma.production.aggregate({
      where,
      _sum: {
        total: true,
        morning: true,
        evening: true,
      },
      _avg: {
        total: true,
      },
    });

    return NextResponse.json({
      productionRecords,
      summary: {
        totalMilk: summary._sum.total || 0,
        totalMorning: summary._sum.morning || 0,
        totalEvening: summary._sum.evening || 0,
        averageDaily: summary._avg.total || 0,
      },
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
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
async function handleCreateProduction(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateProductionSchema.parse(body);

    // Check if animal exists, is matured, and is not disposed
    const animal = await prisma.animal.findUnique({
      where: { id: validatedData.animalId },
      include: { disposals: true },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    if (animal.disposals.length > 0) {
      return NextResponse.json(
        { error: "Cannot add production record to disposed animal" },
        { status: 400 }
      );
    }

    if (!animal.isMatured) {
      return NextResponse.json(
        { error: "Cannot add production record to immature animal" },
        { status: 400 }
      );
    }

    if (animal.gender !== "FEMALE") {
      return NextResponse.json(
        { error: "Only female animals can have production records" },
        { status: 400 }
      );
    }

    // Check if production record for this animal and date already exists
    const recordDate = validatedData.date || new Date();
    const startOfDay = new Date(recordDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(recordDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingRecord = await prisma.production.findFirst({
      where: {
        animalId: validatedData.animalId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: "Production record for this animal and date already exists" },
        { status: 400 }
      );
    }

    // Calculate total milk
    const total = validatedData.morning + validatedData.evening;

    const production = await prisma.production.create({
      data: {
        ...validatedData,
        total,
        recordedById: user.id,
      },
      include: {
        animal: { select: { id: true, tagNumber: true, name: true } },
        recordedBy: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(production, { status: 201 });
  } catch (error) {
    console.error("Error creating production record:", error);
    return NextResponse.json(
      { error: "Failed to create production record" },
      { status: 500 }
    );
  }
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetProduction, 20000); // 20 second timeout
export const POST = withApiTimeout(handleCreateProduction, 25000); // 25 second timeout
