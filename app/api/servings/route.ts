import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || !["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const {
      femaleId,
      servedAt,
      outcome = "PENDING",
      pregnancyDate,
      actualBirthDate,
      notes,
    } = body;

    if (!femaleId) {
      return createSecureErrorResponse("Female animal ID is required", 400, request);
    }

    if (!servedAt) {
      return createSecureErrorResponse("Serving date is required", 400, request);
    }

    const femaleAnimal = await prisma.animal.findUnique({
      where: { id: femaleId },
    });

    if (!femaleAnimal) {
      return createSecureErrorResponse("Female animal not found", 404, request);
    }

    if (femaleAnimal.gender !== "FEMALE") {
      return createSecureErrorResponse("Selected animal must be female", 400, request);
    }

    if (!["SUCCESSFUL", "FAILED", "PENDING"].includes(outcome)) {
      return createSecureErrorResponse(
        "Invalid outcome. Must be SUCCESSFUL, FAILED, or PENDING",
        400,
        request
      );
    }

    const serving = await prisma.serving.create({
      data: {
        femaleId,
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

    return createSecureResponse({
      message: "Serving record created successfully",
      serving,
    }, { status: 201 }, request);
  } catch (error) {
    console.error("Error creating serving record:", error);
    return createSecureErrorResponse("Failed to create serving record", 500, request);
  }
}

export async function GET(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || !["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const outcome = url.searchParams.get("outcome");
    const search = url.searchParams.get("search");

    const skip = (page - 1) * limit;

    let where: any = {};

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

    return createSecureResponse({
      servings,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }, {}, request);
  } catch (error) {
    console.error("Error fetching servings:", error);
    return createSecureErrorResponse("Failed to fetch servings", 500, request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || !["FARM_MANAGER"].includes(user.role)) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const {
      id,
      femaleId,
      servedAt,
      outcome = "PENDING",
      pregnancyDate,
      actualBirthDate,
      notes,
    } = body;

    if (!id) {
      return createSecureErrorResponse("Serving ID is required", 400, request);
    }

    const existingServing = await prisma.serving.findUnique({
      where: { id },
    });

    if (!existingServing) {
      return createSecureErrorResponse("Serving record not found", 404, request);
    }

    if (femaleId && femaleId !== existingServing.femaleId) {
      const femaleAnimal = await prisma.animal.findUnique({
        where: { id: femaleId },
      });

      if (!femaleAnimal) {
        return createSecureErrorResponse("Female animal not found", 404, request);
      }

      if (femaleAnimal.gender !== "FEMALE") {
        return createSecureErrorResponse("Selected animal must be female", 400, request);
      }
    }

    if (outcome && !["SUCCESSFUL", "FAILED", "PENDING"].includes(outcome)) {
      return createSecureErrorResponse(
        "Invalid outcome. Must be SUCCESSFUL, FAILED, or PENDING",
        400,
        request
      );
    }

    const serving = await prisma.serving.update({
      where: { id },
      data: {
        ...(femaleId && { femaleId }),
        ...(servedAt && { servedAt: new Date(servedAt) }),
        ...(outcome && { outcome }),
        pregnancyDate: pregnancyDate ? new Date(pregnancyDate) : null,
        actualBirthDate: actualBirthDate ? new Date(actualBirthDate) : null,
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

    return createSecureResponse({
      message: "Serving record updated successfully",
      serving,
    }, { status: 200 }, request);
  } catch (error) {
    console.error("Error updating serving record:", error);
    return createSecureErrorResponse("Failed to update serving record", 500, request);
  }
}


