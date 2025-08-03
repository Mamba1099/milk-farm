import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { UpdateAnimalSchema } from "@/lib/validators/animal";
import { uploadAnimalImage, deleteAnimalImage } from "@/lib/animal-storage";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const { id } = await params;

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
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
      return createSecureErrorResponse("Animal not found", 404, request);
    }

    return createSecureResponse(animal, {}, request);
  } catch (error) {
    return createSecureErrorResponse("Failed to fetch animal", 500, request);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const { id } = await params;

    const existingAnimal = await prisma.animal.findUnique({
      where: { id },
    });

    if (!existingAnimal) {
      return createSecureErrorResponse("Animal not found", 404, request);
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    let imageUrl = existingAnimal.image;
  
    if (data.imageUrl) {
      if (existingAnimal.image) {
        await deleteAnimalImage(existingAnimal.image);
      }
      imageUrl = data.imageUrl as string;
      delete data.imageUrl;
    } 
    else {
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        const uploadResult = await uploadAnimalImage(imageFile);
        if (uploadResult.error) {
          return createSecureErrorResponse(uploadResult.error, 500, request);
        }
        
        if (existingAnimal.image) {
          await deleteAnimalImage(existingAnimal.image);
        }
        
        imageUrl = uploadResult.imageUrl;
      }
    }

    const animalData = {
      id,
      ...data,
      image: imageUrl,
      weight: data.weight ? parseFloat(data.weight as string) : undefined,
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
        return createSecureErrorResponse("Tag number already exists", 409, request);
      }
    }

    const birthDate = new Date(validatedData.birthDate || existingAnimal.birthDate);
    const today = new Date();
    const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    let expectedMaturityDate: Date;
    const animalType = validatedData.type || existingAnimal.type;
    
    if (animalType === "COW") {
      expectedMaturityDate = new Date(birthDate.getTime() + 24 * 30.44 * 24 * 60 * 60 * 1000);
    } else if (animalType === "BULL") {
      expectedMaturityDate = new Date(birthDate.getTime() + 18 * 30.44 * 24 * 60 * 60 * 1000);
    } else {
      expectedMaturityDate = new Date(birthDate.getTime() + 12 * 30.44 * 24 * 60 * 60 * 1000);
    }

    let isMatured = false;
    let isReadyForProduction = false;

    if (animalType === "COW") {
      isMatured = ageInMonths >= 24;
      if (isMatured && (validatedData.gender || existingAnimal.gender) === "FEMALE") {
        isReadyForProduction = true;
      }
    } else if (animalType === "BULL") {
      isMatured = ageInMonths >= 18;
    } else {
      isMatured = ageInMonths >= 12;
      if (isMatured && (validatedData.gender || existingAnimal.gender) === "FEMALE") {
        isReadyForProduction = true;
      }
    }

    if (expectedMaturityDate <= today) {
      isMatured = true;
      if (animalType === "COW" && (validatedData.gender || existingAnimal.gender) === "FEMALE") {
        isReadyForProduction = true;
      }
      if (animalType === "CALF" && (validatedData.gender || existingAnimal.gender) === "FEMALE") {
        isReadyForProduction = true;
      }
    }

    const { id: _id, ...updateData } = validatedData;

    const cleanUpdateData: any = {
      ...updateData,
      expectedMaturityDate,
      isMatured,
      isReadyForProduction,
    };

    Object.keys(cleanUpdateData).forEach((key: string) => {
      if (cleanUpdateData[key] === undefined) {
        delete cleanUpdateData[key];
      }
    });

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        treatments: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { treatedBy: { select: { username: true } } },
        },
        servings: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { servedBy: { select: { username: true } } },
        },
        productionRecords: {
          orderBy: { date: "desc" },
          take: 10,
          include: { recordedBy: { select: { username: true } } },
        },
      },
    });

    return createSecureResponse(updatedAnimal, {}, request);
  } catch (error) {
    console.error("Animal update error:", error);
    
    // Check if it's a Zod validation error
    if (error instanceof ZodError) {
      return createSecureErrorResponse(
        `Validation error: ${error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`,
        400,
        request
      );
    }
    
    // Check if it's a Prisma error
    if (error instanceof Error && error.message.includes('Prisma')) {
      return createSecureErrorResponse(
        `Database error: ${error.message}`,
        500,
        request
      );
    }
    
    return createSecureErrorResponse(
      `Failed to update animal: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      request
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const { id } = await params;

    const animal = await prisma.animal.findUnique({
      where: { id },
      select: { image: true },
    });

    if (!animal) {
      return createSecureErrorResponse("Animal not found", 404, request);
    }

    if (animal.image) {
      await deleteAnimalImage(animal.image);
    }

    await prisma.animal.delete({
      where: { id },
    });

    return createSecureResponse({ message: "Animal deleted successfully" }, {}, request);
  } catch (error) {
    return createSecureErrorResponse("Failed to delete animal", 500, request);
  }
}
