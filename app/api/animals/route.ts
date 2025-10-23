import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateAnimalSchema, AnimalQuerySchema } from "@/lib/validators/animal";
import { uploadAnimalImage } from "@/lib/animal-storage";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { Prisma } from "@prisma/client";
import { getPublicImageUrl, normalizeImageUrl } from "@/supabase/storage/client";

export async function GET(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Unauthorized", 401, request);
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

    where.disposals = { none: {} };

    const animals = await prisma.animal.findMany({
      where,
      include: {
        treatments: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { recordedBy: { select: { username: true } } },
        },
        servings: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { recordedBy: { select: { username: true } } },
        },
      },
      skip,
      take: validatedQuery.limit,
      orderBy: { createdAt: "desc" },
    });

    const animalsWithImageUrl = animals.map(animal => ({
      ...animal,
      image: normalizeImageUrl(animal.image),
    }));

    const total = await prisma.animal.count({ where });

    return createSecureResponse({
      animals: animalsWithImageUrl,
      pagination: {
        total,
        pages: Math.ceil(total / validatedQuery.limit),
        current: validatedQuery.page,
        limit: validatedQuery.limit,
      },
    }, {}, request);
  } catch (error) {
    return createSecureErrorResponse("Failed to fetch animals", 500, request);
  }
}

export async function POST(request: NextRequest) {
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

    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, unknown> = {};
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      imageFile = formData.get("image") as File;

      if (data.image) {
        delete data.image;
      }
    } else {
      const body = await request.json();
      data = body;
    }

    if (data.weight && typeof data.weight === 'string') {
      const weightNum = parseFloat(data.weight as string);
      data.weight = isNaN(weightNum) ? undefined : weightNum;
    }

    let imageUrl = null;
  
    if (data.imageUrl) {
      imageUrl = data.imageUrl as string;
      delete data.imageUrl;
    } 
    else if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadAnimalImage(imageFile);
      if (uploadResult.error) {
        return createSecureErrorResponse(uploadResult.error, 500, request);
      }
      imageUrl = uploadResult.imageUrl; // Use full URL instead of imagePath
    }

    // Prepare data for validation
    const validationData = {
      ...data,
      image: imageUrl || null, // Ensure null instead of undefined
    };

    const validatedData = CreateAnimalSchema.parse(validationData);

    const createData: any = {
      ...validatedData,
    };

    // The image is already included in validatedData from validation

    const birthDate = new Date(validatedData.birthDate);
    const today = new Date();
    const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    let expectedMaturityDate: Date;
    if (validatedData.expectedMaturityDate) {
      expectedMaturityDate = new Date(validatedData.expectedMaturityDate);
    } else {
      if (validatedData.type === "COW") {
        expectedMaturityDate = new Date(birthDate.getTime() + 24 * 30.44 * 24 * 60 * 60 * 1000);
      } else if (validatedData.type === "BULL") {
        expectedMaturityDate = new Date(birthDate.getTime() + 18 * 30.44 * 24 * 60 * 60 * 1000);
      } else {
        expectedMaturityDate = new Date(birthDate.getTime() + 12 * 30.44 * 24 * 60 * 60 * 1000);
      }
    }

    let isMatured = false;
    let isReadyForProduction = false;

    if (validatedData.type === "COW") {
      isMatured = ageInMonths >= 24;
      if (isMatured && validatedData.gender === "FEMALE") {
        isReadyForProduction = true;
      }
    } else if (validatedData.type === "BULL") {
      isMatured = ageInMonths >= 18;
    } else {
      isMatured = ageInMonths >= 12;
      if (isMatured && validatedData.gender === "FEMALE") {
        isReadyForProduction = true;
      }
    }

    if (expectedMaturityDate <= today) {
      isMatured = true;

      if (validatedData.type === "COW" && validatedData.gender === "FEMALE") {
        isReadyForProduction = true;
      }
      if (validatedData.type === "CALF" && validatedData.gender === "FEMALE") {
        isReadyForProduction = true;
      }
    }

    const animal = await prisma.animal.create({
      data: {
        ...createData,
        expectedMaturityDate,
        isMatured,
        isReadyForProduction,
      },
    });

    const responseAnimal = {
      ...animal,
      image: normalizeImageUrl(animal.image),
    };

    return createSecureResponse(responseAnimal, { status: 201 }, request);
  } catch (error) {
    return createSecureErrorResponse("Failed to create animal", 500, request);
  }
}
