import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateAnimalSchema } from "@/lib/validators/animal";
import { uploadAnimalImage } from "@/lib/file-storage";
import jwt from "jsonwebtoken";
import { withApiTimeout } from "@/lib/api-timeout";

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

async function handleGetAnimal(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const animal = await prisma.animal.findUnique({
      where: { id },
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

async function handleUpdateAnimal(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingAnimal = await prisma.animal.findUnique({
      where: { id },
    });

    if (!existingAnimal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    let imageUrl = existingAnimal.image;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadAnimalImage(imageFile);
    }

    // Process form data
    const animalData = {
      id,
      ...data,
      image: imageUrl,
      weight: data.weight ? parseFloat(data.weight as string) : undefined,
      motherId: data.motherId || undefined,
      fatherId: data.fatherId || undefined,
    };

    const validatedData = UpdateAnimalSchema.parse(animalData);

    if (validatedData.tagNumber) {
      const existingTag = await prisma.animal.findFirst({
        where: {
          tagNumber: validatedData.tagNumber,
          id: { not: id },
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

    // Calculate if animal is matured based on expected maturity date
    let isMatured = existingAnimal.isMatured;
    let isReadyForProduction = existingAnimal.isReadyForProduction;
    let calculatedExpectedMaturityDate = null;

    if (
      validatedData.expectedMaturityDate ||
      validatedData.birthDate ||
      validatedData.type ||
      validatedData.gender
    ) {
      const today = new Date();

      // Determine the expected maturity date to use
      let expectedMaturityDate =
        validatedData.expectedMaturityDate ||
        existingAnimal.expectedMaturityDate;

      // If expected maturity date is not set, calculate it based on birth date and type
      if (!expectedMaturityDate) {
        const birthDate = validatedData.birthDate || existingAnimal.birthDate;
        const type = validatedData.type || existingAnimal.type;

        expectedMaturityDate = new Date(birthDate);
        switch (type) {
          case "CALF":
            expectedMaturityDate.setMonth(expectedMaturityDate.getMonth() + 20); // 20 months for calves
            break;
          case "COW":
          case "BULL":
            expectedMaturityDate.setMonth(expectedMaturityDate.getMonth() + 6); // Already mature, add buffer
            break;
        }
        calculatedExpectedMaturityDate = expectedMaturityDate;
      }

      // Check if animal is matured based on expected maturity date
      if (expectedMaturityDate <= today) {
        isMatured = true;

        const type = validatedData.type || existingAnimal.type;
        const gender = validatedData.gender || existingAnimal.gender;

        // Check if animal is ready for production (mature female cows)
        if (type === "COW" && gender === "FEMALE") {
          isReadyForProduction = true;
        }
        // If it's a mature calf, it should become a cow (will be handled by update logic if needed)
        if (type === "CALF" && gender === "FEMALE") {
          isReadyForProduction = true;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = validatedData;

    const finalUpdateData = {
      ...updateData,
      isMatured,
      isReadyForProduction,
      ...(calculatedExpectedMaturityDate && {
        expectedMaturityDate: calculatedExpectedMaturityDate,
      }),
    };

    const animal = await prisma.animal.update({
      where: { id },
      data: finalUpdateData,
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
async function handleDeleteAnimal(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const animal = await prisma.animal.findUnique({
      where: { id },
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
      where: { id },
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

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetAnimal, 30000); // 20 second timeout
export const PUT = withApiTimeout(handleUpdateAnimal, 30000); // 30 second timeout  
export const DELETE = withApiTimeout(handleDeleteAnimal, 20000); // 15 second timeout
