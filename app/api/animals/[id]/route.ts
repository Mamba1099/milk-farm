import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateAnimalSchema } from "@/lib/validators/animal";
import { uploadFile } from "@/lib/file-storage";
import jwt from "jsonwebtoken";

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

// GET /api/animals/[id] - Get specific animal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const animal = await prisma.animal.findUnique({
      where: { id: params.id },
      include: {
        mother: { select: { id: true, tagNumber: true, name: true } },
        father: { select: { id: true, tagNumber: true, name: true } },
        motherOf: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
            type: true,
            birthDate: true,
          },
        },
        fatherOf: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
            type: true,
            birthDate: true,
          },
        },
        treatments: {
          orderBy: { createdAt: "desc" },
          include: { treatedBy: { select: { username: true } } },
        },
        servings: {
          orderBy: { createdAt: "desc" },
          include: { servedBy: { select: { username: true } } },
        },
        productionRecords: {
          orderBy: { date: "desc" },
          include: { recordedBy: { select: { username: true } } },
        },
        disposals: {
          include: { disposedBy: { select: { username: true } } },
        },
      },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    return NextResponse.json(animal);
  } catch (error) {
    console.error("Error fetching animal:", error);
    return NextResponse.json(
      { error: "Failed to fetch animal" },
      { status: 500 }
    );
  }
}

// PUT /api/animals/[id] - Update specific animal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only farm managers can update animals
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const existingAnimal = await prisma.animal.findUnique({
      where: { id: params.id },
    });

    if (!existingAnimal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Handle image upload
    let imageUrl = existingAnimal.image;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFile(imageFile, "animal-images");
    }

    // Process form data
    const animalData = {
      id: params.id,
      ...data,
      image: imageUrl,
      weight: data.weight ? parseFloat(data.weight as string) : undefined,
      motherId: data.motherId || undefined,
      fatherId: data.fatherId || undefined,
    };

    const validatedData = UpdateAnimalSchema.parse(animalData);

    // Check if tag number already exists (excluding current animal)
    if (validatedData.tagNumber) {
      const existingTag = await prisma.animal.findFirst({
        where: {
          tagNumber: validatedData.tagNumber,
          id: { not: params.id },
        },
      });

      if (existingTag) {
        return NextResponse.json(
          { error: "An animal with this tag number already exists" },
          { status: 400 }
        );
      }
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

    // Calculate if animal is matured if birth date changed
    let isMatured = existingAnimal.isMatured;
    if (validatedData.birthDate || validatedData.type) {
      const today = new Date();
      const birthDate = validatedData.birthDate || existingAnimal.birthDate;
      const type = validatedData.type || existingAnimal.type;
      const ageInMonths =
        (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

      if (type === "CALF" && ageInMonths >= 12) {
        isMatured = true;
      } else if ((type === "COW" || type === "BULL") && ageInMonths >= 24) {
        isMatured = true;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = validatedData;
    const animal = await prisma.animal.update({
      where: { id: params.id },
      data: {
        ...updateData,
        isMatured,
      },
      include: {
        mother: { select: { id: true, tagNumber: true, name: true } },
        father: { select: { id: true, tagNumber: true, name: true } },
      },
    });

    return NextResponse.json(animal);
  } catch (error) {
    console.error("Error updating animal:", error);
    return NextResponse.json(
      { error: "Failed to update animal" },
      { status: 500 }
    );
  }
}

// DELETE /api/animals/[id] - Delete specific animal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only farm managers can delete animals
    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const animal = await prisma.animal.findUnique({
      where: { id: params.id },
      include: {
        motherOf: true,
        fatherOf: true,
        treatments: true,
        servings: true,
        productionRecords: true,
      },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    // Check if animal has children or other dependencies
    if (animal.motherOf.length > 0 || animal.fatherOf.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete animal that has offspring. Consider disposing instead.",
        },
        { status: 400 }
      );
    }

    await prisma.animal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Animal deleted successfully" });
  } catch (error) {
    console.error("Error deleting animal:", error);
    return NextResponse.json(
      { error: "Failed to delete animal" },
      { status: 500 }
    );
  }
}
