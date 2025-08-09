import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productionSchema } from "@/lib/validators/animal";
import {
  calculateBalanceMorning,
  calculateBalanceEvening,
  calculateTotalMorning,
  calculateTotalEvening
} from "@/lib/services/production-calculations";
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

    const [morningProductions, morningTotal] = await Promise.all([
      prisma.morningProduction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true } },
          recordedBy: { select: { id: true, username: true } },
        },
      }),
      prisma.morningProduction.count({ where }),
    ]);
    const [eveningProductions, eveningTotal] = await Promise.all([
      prisma.eveningProduction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true } },
          recordedBy: { select: { id: true, username: true } },
        },
      }),
      prisma.eveningProduction.count({ where }),
    ]);
    const totalPages = Math.ceil((morningTotal + eveningTotal) / limit);
    return createSecureResponse({
      morningProductions,
      eveningProductions,
      pagination: {
        page,
        limit,
        total: morningTotal + eveningTotal,
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


    // Morning Production
    if (body.type === "morning") {
      const { animalId, date, quantity_am, calf_quantity_fed_am, notes } = body;
      const animal = await prisma.animal.findUnique({ where: { id: animalId } });
      if (!animal) return createSecureErrorResponse("Animal not found", 404, request);
      if (!animal.isReadyForProduction) return createSecureErrorResponse("Animal is not ready for production", 400, request);
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      const existingRecord = await prisma.morningProduction.findFirst({
        where: { animalId, date: { gte: startOfDay, lt: endOfDay } },
      });
      if (existingRecord) return createSecureErrorResponse("Morning production record already exists for this animal on this date", 409, request);
      const balance_am = quantity_am - calf_quantity_fed_am;
      const morningProduction = await prisma.morningProduction.create({
        data: { animalId, date: new Date(date), quantity_am, calf_quantity_fed_am, balance_am, recordedById: user.id, notes },
        include: { animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true } }, recordedBy: { select: { id: true, username: true } } },
      });
      return createSecureResponse({ message: "Morning production record created successfully", morningProduction }, { status: 201 }, request);
    }
    // Evening Production
    if (body.type === "evening") {
      const { animalId, date, quantity_pm, calf_quantity_fed_pm, notes } = body;
      const animal = await prisma.animal.findUnique({ where: { id: animalId } });
      if (!animal) return createSecureErrorResponse("Animal not found", 404, request);
      if (!animal.isReadyForProduction) return createSecureErrorResponse("Animal is not ready for production", 400, request);
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      const existingRecord = await prisma.eveningProduction.findFirst({
        where: { animalId, date: { gte: startOfDay, lt: endOfDay } },
      });
      if (existingRecord) return createSecureErrorResponse("Evening production record already exists for this animal on this date", 409, request);
      const balance_pm = quantity_pm - calf_quantity_fed_pm;
      const eveningProduction = await prisma.eveningProduction.create({
        data: { animalId, date: new Date(date), quantity_pm, calf_quantity_fed_pm, balance_pm, recordedById: user.id, notes },
        include: { animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true } }, recordedBy: { select: { id: true, username: true } } },
      });
      return createSecureResponse({ message: "Evening production record created successfully", eveningProduction }, { status: 201 }, request);
    }
    // Production Summary
    if (body.type === "summary") {
      const { date, posho_deduction_am, posho_deduction_pm } = body;
      const morningBalances = await prisma.morningProduction.findMany({ where: { date: new Date(date) } });
      const total_morning = calculateTotalMorning(morningBalances);
      const yesterday = new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000);
      const prevSummary = await prisma.productionSummary.findUnique({ where: { date: yesterday } });
      const balance_yesterday = prevSummary?.balance_evening || 0;
      const balance_morning = calculateBalanceMorning(total_morning, balance_yesterday, posho_deduction_am);
      const eveningBalances = await prisma.eveningProduction.findMany({ where: { date: new Date(date) } });
      const total_evening = calculateTotalEvening(eveningBalances);
      const balance_evening = calculateBalanceEvening(total_evening, balance_morning, posho_deduction_pm);
      // Save summary
      const summary = await prisma.productionSummary.upsert({
        where: { date: new Date(date) },
        update: { total_morning, balance_morning, balance_yesterday, total_evening, balance_evening, posho_deduction_am, posho_deduction_pm },
        create: { date: new Date(date), total_morning, balance_morning, balance_yesterday, total_evening, balance_evening, posho_deduction_am, posho_deduction_pm },
      });
      return createSecureResponse({ message: "Production summary updated", summary }, { status: 201 }, request);
    }
    return createSecureErrorResponse("Invalid production type", 400, request);

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

  // ...existing code...
  // Refactor needed: update logic for morningProduction/eveningProduction
  return createSecureErrorResponse("PUT not implemented for new production models", 400, request);

  } catch (error) {
    console.error("Error updating production record:", error);
    return createSecureErrorResponse("Failed to update production record", 500, request);
  }
}


export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
