import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateTreatmentSchema } from "@/lib/validators/animal";
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

// GET /api/treatments - Get all treatments with filtering
async function handleGetTreatments(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get("animalId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = animalId ? { animalId } : {};

    const treatments = await prisma.treatment.findMany({
      where,
      include: {
        animal: { select: { id: true, tagNumber: true, name: true } },
        treatedBy: { select: { id: true, username: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.treatment.count({ where });

    return NextResponse.json({
      treatments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { error: "Failed to fetch treatments" },
      { status: 500 }
    );
  }
}

// POST /api/treatments - Create new treatment
async function handleCreateTreatment(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateTreatmentSchema.parse(body);

    // Check if animal exists and is not disposed
    const animal = await prisma.animal.findUnique({
      where: { id: validatedData.animalId },
      include: { disposals: true },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    if (animal.disposals.length > 0) {
      return NextResponse.json(
        { error: "Cannot add treatment to disposed animal" },
        { status: 400 }
      );
    }

    // Update animal health status to SICK if it's currently HEALTHY
    if (animal.healthStatus === "HEALTHY") {
      await prisma.animal.update({
        where: { id: validatedData.animalId },
        data: { healthStatus: "SICK" },
      });
    }

    const treatment = await prisma.treatment.create({
      data: {
        ...validatedData,
        treatedById: user.id,
      },
      include: {
        animal: { select: { id: true, tagNumber: true, name: true } },
        treatedBy: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(treatment, { status: 201 });
  } catch (error) {
    console.error("Error creating treatment:", error);
    return NextResponse.json(
      { error: "Failed to create treatment" },
      { status: 500 }
    );
  }
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetTreatments, 20000); // 20 second timeout
export const POST = withApiTimeout(handleCreateTreatment, 25000); // 25 second timeout
