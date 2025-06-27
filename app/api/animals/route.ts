import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateAnimalSchema, AnimalQuerySchema } from "@/lib/validators/animal";
import { uploadAnimalImage, validateImageFile } from "@/lib/file-storage";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, username: true },
    });
    return user;
  } catch {
    return null;
  }
}

// GET /api/animals - Get all animals with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      gender: searchParams.get("gender") || undefined,
      healthStatus: searchParams.get("healthStatus") || undefined,
      isMatured: searchParams.get("isMatured")
        ? searchParams.get("isMatured") === "true"
        : undefined,
    };

    const validatedQuery = AnimalQuerySchema.parse(queryParams);
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Build where clause
    const where: Prisma.AnimalWhereInput = {};

    if (validatedQuery.search) {
      where.OR = [
        { tagNumber: { contains: validatedQuery.search, mode: "insensitive" } },
        { name: { contains: validatedQuery.search, mode: "insensitive" } },
      ];
    }

    if (validatedQuery.type) where.type = validatedQuery.type;
    if (validatedQuery.gender) where.gender = validatedQuery.gender;
    if (validatedQuery.healthStatus)
      where.healthStatus = validatedQuery.healthStatus;
    if (validatedQuery.isMatured !== undefined)
      where.isMatured = validatedQuery.isMatured;

    // Exclude disposed animals
    where.disposals = { none: {} };

    const animals = await prisma.animal.findMany({
      where,
      include: {
        mother: { select: { id: true, tagNumber: true, name: true } },
        father: { select: { id: true, tagNumber: true, name: true } },
        motherOf: { select: { id: true, tagNumber: true, name: true } },
        fatherOf: { select: { id: true, tagNumber: true, name: true } },
        treatments: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { treatedBy: { select: { username: true } } },
        },
        servings: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { servedBy: { select: { username: true } } },
        },
        productionRecords: {
          orderBy: { date: "desc" },
          take: 7,
          include: { recordedBy: { select: { username: true } } },
        },
      },
      skip,
      take: validatedQuery.limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.animal.count({ where });

    return NextResponse.json({
      animals,
      pagination: {
        total,
        pages: Math.ceil(total / validatedQuery.limit),
        current: validatedQuery.page,
        limit: validatedQuery.limit,
      },
    });
  } catch (error) {
    console.error("Error fetching animals:", error);
    return NextResponse.json(
      { error: "Failed to fetch animals" },
      { status: 500 }
    );
  }
}

// POST /api/animals - Create new animal
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only farm managers can create animals
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Handle image upload
    let imageUrl = null;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      // Validate image file
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      imageUrl = await uploadAnimalImage(imageFile);
      if (!imageUrl) {
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Process form data
    const animalData = {
      ...data,
      image: imageUrl,
      weight: data.weight ? parseFloat(data.weight as string) : undefined,
      motherId: data.motherId || undefined,
      fatherId: data.fatherId || undefined,
    };

    const validatedData = CreateAnimalSchema.parse(animalData);

    // Check if tag number already exists
    const existingAnimal = await prisma.animal.findUnique({
      where: { tagNumber: validatedData.tagNumber },
    });

    if (existingAnimal) {
      return NextResponse.json(
        { error: "An animal with this tag number already exists" },
        { status: 400 }
      );
    }

    // Validate parent relationships
    if (validatedData.motherId) {
      const mother = await prisma.animal.findUnique({
        where: { id: validatedData.motherId },
      });
      if (!mother || mother.gender !== "FEMALE") {
        return NextResponse.json(
          { error: "Mother must be a female animal" },
          { status: 400 }
        );
      }
    }

    if (validatedData.fatherId) {
      const father = await prisma.animal.findUnique({
        where: { id: validatedData.fatherId },
      });
      if (!father || father.gender !== "MALE") {
        return NextResponse.json(
          { error: "Father must be a male animal" },
          { status: 400 }
        );
      }
    }

    // Calculate if animal is matured (assuming 2 years for cows/bulls, 1 year for calves)
    const today = new Date();
    const birthDate = new Date(validatedData.birthDate);
    const ageInMonths =
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    let isMatured = false;
    if (validatedData.type === "CALF" && ageInMonths >= 12) {
      isMatured = true;
    } else if (
      (validatedData.type === "COW" || validatedData.type === "BULL") &&
      ageInMonths >= 24
    ) {
      isMatured = true;
    }

    const animal = await prisma.animal.create({
      data: {
        ...validatedData,
        isMatured,
      },
      include: {
        mother: { select: { id: true, tagNumber: true, name: true } },
        father: { select: { id: true, tagNumber: true, name: true } },
      },
    });

    return NextResponse.json(animal, { status: 201 });
  } catch (error) {
    console.error("Error creating animal:", error);
    return NextResponse.json(
      { error: "Failed to create animal" },
      { status: 500 }
    );
  }
}
