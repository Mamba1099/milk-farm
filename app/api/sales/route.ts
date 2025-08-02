import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { CreateSalesSchema } from "@/lib/validators/sales";

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

    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get("animalId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.SalesWhereInput = {};

    if (animalId) where.animalId = animalId;

    if (date) {
      const dateObj = new Date(date);
      where.date = {
        gte: new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate()
        ),
        lt: new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate() + 1
        ),
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [sales, total] = await Promise.all([
      prisma.sales.findMany({
        where,
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
          soldBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          timeRecorded: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.sales.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return createSecureResponse({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }, {}, request);
  } catch (error) {
    console.error("Error fetching sales records:", error);
    return createSecureErrorResponse("Failed to fetch sales records", 500, request);
  }
}

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
    const validatedData = CreateSalesSchema.parse(body);

    const salesDate = new Date(validatedData.date);
    const timeRecorded = new Date();
    const totalAmount = validatedData.quantity * validatedData.pricePerLiter;

    if (validatedData.animalId) {
      const animal = await prisma.animal.findUnique({
        where: { id: validatedData.animalId },
        include: {
          disposals: true,
        },
      });

      if (!animal) {
        return createSecureErrorResponse("Animal not found", 404, request);
      }

      if (animal.disposals.length > 0) {
        return createSecureErrorResponse("Cannot record sales for disposed animal", 400, request);
      }

      const productionToday = await prisma.production.findUnique({
        where: {
          animalId_date: {
            animalId: validatedData.animalId,
            date: new Date(
              salesDate.getFullYear(),
              salesDate.getMonth(),
              salesDate.getDate()
            ),
          },
        },
      });

      if (!productionToday) {
        return createSecureErrorResponse("No production record found for this animal today", 400, request);
      }

      const totalSalesToday = await prisma.sales.aggregate({
        where: {
          animalId: validatedData.animalId,
          date: {
            gte: new Date(
              salesDate.getFullYear(),
              salesDate.getMonth(),
              salesDate.getDate()
            ),
            lt: new Date(
              salesDate.getFullYear(),
              salesDate.getMonth(),
              salesDate.getDate() + 1
            ),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const totalSoldToday = totalSalesToday._sum.quantity || 0;
      const availableQuantity =
        productionToday.availableForSales - totalSoldToday;

      if (validatedData.quantity > availableQuantity) {
        return createSecureErrorResponse(
          `Insufficient milk available. Available: ${availableQuantity} liters, Requested: ${validatedData.quantity} liters`,
          400,
          request
        );
      }
    }

    const sales = await prisma.sales.create({
      data: {
        animalId: validatedData.animalId,
        date: salesDate,
        timeRecorded,
        quantity: validatedData.quantity,
        pricePerLiter: validatedData.pricePerLiter,
        totalAmount,
        soldById: user.id,
        customerName: validatedData.customerName,
        notes: validatedData.notes,
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
        soldBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return createSecureResponse({
      message: "Sales record created successfully",
      sales,
    }, { status: 201 }, request);
  } catch (error) {
    console.error("Error creating sales record:", error);

    if (error instanceof z.ZodError) {
      return createSecureErrorResponse(error.errors[0].message, 400, request);
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create sales record";
    return createSecureErrorResponse(errorMessage, 500, request);
  }
}


