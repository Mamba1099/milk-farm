import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productionSchema } from "@/lib/validators/animal";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) return securityError;

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const animalId = searchParams.get("animalId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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

    return createSecureResponse({
      productions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error fetching production records:", error);
    return createSecureErrorResponse("Failed to fetch production records", 500, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) return securityError;

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const body = await request.json();

    const validation = productionSchema.safeParse(body);
    if (!validation.success) {
      return createSecureErrorResponse(
        `Invalid data: ${validation.error.issues.map(i => i.message).join(', ')}`,
        400,
        request
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

    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal) {
      return createSecureErrorResponse("Animal not found", 404, request);
    }

    if (!animal.isReadyForProduction) {
      return createSecureErrorResponse(
        "Animal is not ready for production",
        400,
        request
      );
    }

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
      return createSecureErrorResponse(
        "Production record already exists for this animal on this date",
        409,
        request
      );
    }

    const totalQuantity = morningQuantity + eveningQuantity;
    const totalDeductions = calfQuantity + poshoQuantity;
    const availableForSales = Math.max(0, totalQuantity - totalDeductions);

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
        carryOverQuantity: 0,
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

    return createSecureResponse({
      message: "Production record created successfully",
      production,
    }, { status: 201 }, request);

  } catch (error) {
    console.error("Error creating production record:", error);
    return createSecureErrorResponse("Failed to create production record", 500, request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) return securityError;

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return createSecureErrorResponse("Production ID is required", 400, request);
    }

    const body = await request.json();

    const validation = productionSchema.safeParse(body);
    if (!validation.success) {
      return createSecureErrorResponse(
        `Invalid data: ${validation.error.issues.map(i => i.message).join(', ')}`,
        400,
        request
      );
    }

    const {
      morningQuantity,
      eveningQuantity,
      calfQuantity,
      poshoQuantity,
      notes,
    } = validation.data;

    const existingRecord = await prisma.production.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return createSecureErrorResponse("Production record not found", 404, request);
    }

    const totalQuantity = morningQuantity + eveningQuantity;
    const totalDeductions = calfQuantity + poshoQuantity;
    const availableForSales = Math.max(0, totalQuantity - totalDeductions);

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

    return createSecureResponse({
      message: "Production record updated successfully",
      production,
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error updating production record:", error);
    return createSecureErrorResponse("Failed to update production record", 500, request);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) return securityError;

    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return createSecureErrorResponse("Production ID is required", 400, request);
    }

    const existingRecord = await prisma.production.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return createSecureErrorResponse("Production record not found", 404, request);
    }

    await prisma.production.delete({
      where: { id },
    });

    return createSecureResponse({
      message: "Production record deleted successfully",
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error deleting production record:", error);
    return createSecureErrorResponse("Failed to delete production record", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
