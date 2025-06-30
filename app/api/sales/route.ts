import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { withApiTimeout } from "@/lib/api-timeout";
import { z } from "zod";

// Validation schema for sales records
const CreateSalesSchema = z.object({
  animalId: z.string().optional(),
  date: z.string().datetime("Invalid date format"),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  pricePerLiter: z.number().min(0.1, "Price per liter must be greater than 0"),
  customerName: z.string().optional(),
  notes: z.string().optional(),
});

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

// GET /api/sales - Get all sales records with filtering
async function handleGetSales(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching sales records:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales records" },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create a new sales record
async function handleCreateSales(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateSalesSchema.parse(body);

    // Parse the date
    const salesDate = new Date(validatedData.date);
    const timeRecorded = new Date();

    // Calculate total amount
    const totalAmount = validatedData.quantity * validatedData.pricePerLiter;

    // Check if there's available milk for sales today if animalId is provided
    if (validatedData.animalId) {
      const animal = await prisma.animal.findUnique({
        where: { id: validatedData.animalId },
        include: {
          disposals: true,
        },
      });

      if (!animal) {
        return NextResponse.json(
          { error: "Animal not found" },
          { status: 404 }
        );
      }

      // Check if animal is disposed
      if (animal.disposals.length > 0) {
        return NextResponse.json(
          { error: "Cannot record sales for disposed animal" },
          { status: 400 }
        );
      }

      // Get today's production record for this animal
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
        return NextResponse.json(
          { error: "No production record found for this animal today" },
          { status: 400 }
        );
      }

      // Check if there's enough milk available for sales
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
        return NextResponse.json(
          {
            error: `Insufficient milk available. Available: ${availableQuantity} liters, Requested: ${validatedData.quantity} liters`,
          },
          { status: 400 }
        );
      }
    }

    // Create sales record
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

    return NextResponse.json({
      message: "Sales record created successfully",
      sales,
    });
  } catch (error) {
    console.error("Error creating sales record:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create sales record";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetSales, 30000);
export const POST = withApiTimeout(handleCreateSales, 30000);
