import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productionSchema } from "@/lib/validators/animal";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { updateDaySummary } from "@/lib/services/production-balance";

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
    const all = searchParams.get("all") === "true";

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
      let startOfDay: Date;
      let endOfDay: Date;
      
      if (date.includes('T')) {
        const dateObj = new Date(date);
        startOfDay = new Date(Date.UTC(
          dateObj.getUTCFullYear(),
          dateObj.getUTCMonth(),
          dateObj.getUTCDate(),
          0, 0, 0, 0
        ));
        endOfDay = new Date(Date.UTC(
          dateObj.getUTCFullYear(),
          dateObj.getUTCMonth(),
          dateObj.getUTCDate(),
          23, 59, 59, 999
        ));
      } else {
        const [year, month, day] = date.split('-').map(Number);
        startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      }

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        if (startDate.includes('T')) {
          where.date.gte = new Date(startDate);
        } else {
          const [year, month, day] = startDate.split('-').map(Number);
          where.date.gte = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        }
      }
      if (endDate) { 
        if (endDate.includes('T')) {
          where.date.lte = new Date(endDate);
        } else {
          const [year, month, day] = endDate.split('-').map(Number);
          where.date.lte = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        }
      }
    } else if (!all) {
      const today = new Date();
      const startOfToday = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0, 0, 0, 0
      ));
      const endOfToday = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        23, 59, 59, 999
      ));

      where.date = {
        gte: startOfToday,
        lte: endOfToday,
      };
    }

    const [morningProductions, morningTotal] = await Promise.all([
      prisma.morningProduction.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
          animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true, motherName: true } },
          recordedBy: { select: { id: true, username: true } },
        },
      }),
      prisma.morningProduction.count({ where }),
    ]);
    
    const [eveningProductions, eveningTotal] = await Promise.all([
      prisma.eveningProduction.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
          animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true, motherName: true } },
          recordedBy: { select: { id: true, username: true } },
        },
      }),
      prisma.eveningProduction.count({ where }),
    ]);

    const combinedRecordsMap = new Map();

    morningProductions.forEach((record) => {
      const dateKey = new Date(record.date).toDateString();
      const key = `${record.animalId}-${dateKey}`;
      
      combinedRecordsMap.set(key, {
        id: record.id,
        animalId: record.animalId,
        date: record.date,
        quantity_am: record.quantity_am,
        quantity_pm: null,
        calf_quantity_fed_am: record.calf_quantity_fed_am,
        calf_quantity_fed_pm: null,
        balance_am: record.balance_am,
        balance_pm: null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        animal: record.animal,
        recordedBy: record.recordedBy,
      });
    });

    eveningProductions.forEach((record) => {
      const dateKey = new Date(record.date).toDateString();
      const key = `${record.animalId}-${dateKey}`;
      
      if (combinedRecordsMap.has(key)) {
        const existingRecord = combinedRecordsMap.get(key);
        existingRecord.quantity_pm = record.quantity_pm;
        existingRecord.calf_quantity_fed_pm = record.calf_quantity_fed_pm;
        existingRecord.balance_pm = record.balance_pm;
        if (new Date(record.updatedAt) > new Date(existingRecord.updatedAt)) {
          existingRecord.updatedAt = record.updatedAt;
        }
      } else {
        combinedRecordsMap.set(key, {
          id: record.id,
          animalId: record.animalId,
          date: record.date,
          quantity_am: null,
          quantity_pm: record.quantity_pm,
          calf_quantity_fed_am: null,
          calf_quantity_fed_pm: record.calf_quantity_fed_pm,
          balance_am: null,
          balance_pm: record.balance_pm,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          animal: record.animal,
          recordedBy: record.recordedBy,
        });
      }
    });

    const combinedRecords = Array.from(combinedRecordsMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const paginatedRecords = combinedRecords.slice(skip, skip + limit);
    const totalCombinedRecords = combinedRecords.length;
    const totalPages = Math.ceil(totalCombinedRecords / limit);

    return createSecureResponse({
      records: paginatedRecords,
      pagination: {
        page,
        limit,
        total: totalCombinedRecords,
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


    if (body.type === "morning") {
      const { animalId, date, quantity_am, calf_quantity_fed_am } = body;
      const animal = await prisma.animal.findUnique({ where: { id: animalId } });
      if (!animal) return createSecureErrorResponse("Animal not found", 404, request);
      const isCalfFeedingOnly = quantity_am === 0 && calf_quantity_fed_am > 0;
      const isProductiveAnimal = quantity_am > 0;
      
      if (isProductiveAnimal && !animal.isReadyForProduction) {
        return createSecureErrorResponse("Animal is not ready for production", 400, request);
      }
      
      if (!isCalfFeedingOnly && !isProductiveAnimal) {
        return createSecureErrorResponse("Please provide either production quantity or calf feeding quantity", 400, request);
      }
      
      const targetDate = new Date(date);
      const startOfDay = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        0, 0, 0, 0
      ));
      const endOfDay = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        23, 59, 59, 999
      ));
      const existingRecord = await prisma.morningProduction.findFirst({
        where: { animalId, date: { gte: startOfDay, lt: endOfDay } },
      });
      if (existingRecord) return createSecureErrorResponse("Morning production record already exists for this animal on this date", 409, request);
      
      await prisma.$transaction(async (tx) => {
        const balance_am = quantity_am - calf_quantity_fed_am;
        
        const morningProduction = await tx.morningProduction.create({
          data: { animalId, date: new Date(date), quantity_am, calf_quantity_fed_am, balance_am, recordedById: user.id },
          include: { animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true, motherName: true } }, recordedBy: { select: { id: true, username: true } } },
        });

        if (isProductiveAnimal && calf_quantity_fed_am > 0) {
          const calves = await tx.animal.findMany({
            where: { 
              type: "CALF",
              motherName: animal.name || animal.tagNumber
            }
          });

          for (const calf of calves) {
            const existingCalfRecord = await tx.morningProduction.findFirst({
              where: { 
                animalId: calf.id, 
                date: { gte: startOfDay, lt: endOfDay } 
              },
            });

            if (!existingCalfRecord) {
              await tx.morningProduction.create({
                data: { 
                  animalId: calf.id, 
                  date: new Date(date), 
                  quantity_am: 0, 
                  calf_quantity_fed_am: calf_quantity_fed_am / calves.length,
                  balance_am: 0,
                  recordedById: user.id 
                },
              });
            }
          }
        }

        if (animal.type === "CALF" && animal.motherName && isCalfFeedingOnly) {
          const mother = await tx.animal.findFirst({
            where: { 
              OR: [
                { name: animal.motherName },
                { tagNumber: animal.motherName }
              ]
            }
          });

          if (mother) {
            const existingMotherRecord = await tx.morningProduction.findFirst({
              where: { 
                animalId: mother.id, 
                date: { gte: startOfDay, lt: endOfDay } 
              },
            });

            if (existingMotherRecord) {
              await tx.morningProduction.update({
                where: { id: existingMotherRecord.id },
                data: { 
                  calf_quantity_fed_am: (existingMotherRecord.calf_quantity_fed_am || 0) + calf_quantity_fed_am,
                  balance_am: (existingMotherRecord.quantity_am || 0) - ((existingMotherRecord.calf_quantity_fed_am || 0) + calf_quantity_fed_am)
                }
              });
            }
          }
        }
      });

      const createdRecord = await prisma.morningProduction.findFirst({
        where: { animalId, date: { gte: startOfDay, lt: endOfDay } },
        include: { animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true, motherName: true } }, recordedBy: { select: { id: true, username: true } } },
      });

      await updateDaySummary(targetDate);

      return createSecureResponse({ message: "Morning production record created successfully", morningProduction: createdRecord }, { status: 201 }, request);
    }

    if (body.type === "evening") {
      const { animalId, date, quantity_pm, calf_quantity_fed_pm } = body;
      const animal = await prisma.animal.findUnique({ where: { id: animalId } });
      if (!animal) return createSecureErrorResponse("Animal not found", 404, request);
      
      const isCalfFeedingOnly = quantity_pm === 0 && calf_quantity_fed_pm > 0;
      const isProductiveAnimal = quantity_pm > 0;
      
      if (isProductiveAnimal && !animal.isReadyForProduction) {
        return createSecureErrorResponse("Animal is not ready for production", 400, request);
      }
      
      if (!isCalfFeedingOnly && !isProductiveAnimal) {
        return createSecureErrorResponse("Please provide either production quantity or calf feeding quantity", 400, request);
      }
      
      const targetDate = new Date(date);
      const startOfDay = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        0, 0, 0, 0
      ));
      const endOfDay = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        23, 59, 59, 999
      ));
      const existingRecord = await prisma.eveningProduction.findFirst({
        where: { animalId, date: { gte: startOfDay, lt: endOfDay } },
      });
      if (existingRecord) return createSecureErrorResponse("Evening production record already exists for this animal on this date", 409, request);
      await prisma.$transaction(async (tx) => {
        const balance_pm = quantity_pm - calf_quantity_fed_pm;
        const eveningProduction = await tx.eveningProduction.create({
          data: { animalId, date: new Date(date), quantity_pm, calf_quantity_fed_pm, balance_pm, recordedById: user.id },
          include: { animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true, motherName: true } }, recordedBy: { select: { id: true, username: true } } },
        });

        if (isProductiveAnimal && calf_quantity_fed_pm > 0) {
          const calves = await tx.animal.findMany({
            where: { 
              type: "CALF",
              motherName: animal.name || animal.tagNumber
            }
          });

          for (const calf of calves) {
            const existingCalfRecord = await tx.eveningProduction.findFirst({
              where: { 
                animalId: calf.id, 
                date: { gte: startOfDay, lt: endOfDay } 
              },
            });

            if (!existingCalfRecord) {
              await tx.eveningProduction.create({
                data: { 
                  animalId: calf.id, 
                  date: new Date(date), 
                  quantity_pm: 0,
                  calf_quantity_fed_pm: calf_quantity_fed_pm / calves.length,
                  balance_pm: 0,
                  recordedById: user.id 
                },
              });
            }
          }
        }

        if (animal.type === "CALF" && animal.motherName && isCalfFeedingOnly) {
          const mother = await tx.animal.findFirst({
            where: { 
              OR: [
                { name: animal.motherName },
                { tagNumber: animal.motherName }
              ]
            }
          });

          if (mother) {
            const existingMotherRecord = await tx.eveningProduction.findFirst({
              where: { 
                animalId: mother.id, 
                date: { gte: startOfDay, lt: endOfDay } 
              },
            });

            if (existingMotherRecord) {
              await tx.eveningProduction.update({
                where: { id: existingMotherRecord.id },
                data: { 
                  calf_quantity_fed_pm: (existingMotherRecord.calf_quantity_fed_pm || 0) + calf_quantity_fed_pm,
                  balance_pm: (existingMotherRecord.quantity_pm || 0) - ((existingMotherRecord.calf_quantity_fed_pm || 0) + calf_quantity_fed_pm)
                }
              });
            }
          }
        }
      });

      const createdRecord = await prisma.eveningProduction.findFirst({
        where: { animalId, date: { gte: startOfDay, lt: endOfDay } },
        include: { animal: { select: { id: true, tagNumber: true, name: true, type: true, image: true, motherName: true } }, recordedBy: { select: { id: true, username: true } } },
      });

      await updateDaySummary(targetDate);

      return createSecureResponse({ message: "Evening production record created successfully", eveningProduction: createdRecord }, { status: 201 }, request);
    }
    /**
     * Production Summary - using simplified balance service
     */
    if (body.type === "summary") {
      const { date } = body;
      await updateDaySummary(new Date(date));
      const summary = await prisma.productionSummary.findUnique({ 
        where: { date: new Date(date) } 
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

  return createSecureErrorResponse("PUT not implemented for new production models", 400, request);

  } catch (error) {
    console.error("Error updating production record:", error);
    return createSecureErrorResponse("Failed to update production record", 500, request);
  }
}


export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
