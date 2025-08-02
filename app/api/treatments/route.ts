import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateTreatmentSchema } from "@/lib/validators/animal";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get("animalId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = animalId ? { animalId } : {};

    const treatments = await prisma.treatment.findMany({
      where,
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            tagNumber: true,
          },
        },
        treatedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.treatment.count({ where });

    return createSecureResponse({
      treatments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error fetching treatments:", error);
    return createSecureErrorResponse("Failed to fetch treatments", 500, request);
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
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const body = await request.json();

    try {
      const validatedData = CreateTreatmentSchema.parse(body);

      const animal = await prisma.animal.findUnique({
        where: { id: validatedData.animalId },
        include: { disposals: true },
      });

      if (!animal) {
        return createSecureErrorResponse("Animal not found", 404, request);
      }

      if (animal.disposals.length > 0) {
        return createSecureErrorResponse(
          "Cannot add treatment to disposed animal",
          400,
          request
        );
      }

      if (animal.healthStatus === "HEALTHY") {
        await prisma.animal.update({
          where: { id: validatedData.animalId },
          data: { healthStatus: "SICK" },
        });
      }

      const treatment = await prisma.treatment.create({
        data: {
          animalId: validatedData.animalId,
          disease: validatedData.disease,
          medicine: validatedData.medicine || "",
          dosage: validatedData.dosage || "",
          treatment: validatedData.treatment,
          cost: validatedData.cost,
          treatedAt: validatedData.treatedAt,
          notes: validatedData.notes,
          treatedById: user.id,
        },
        include: {
          animal: { select: { id: true, tagNumber: true, name: true } },
          treatedBy: { select: { id: true, username: true } },
        },
      });

      return createSecureResponse({
        message: "Treatment created successfully",
        treatment,
      }, { status: 201 }, request);

    } catch (validationError) {
      return createSecureErrorResponse("Invalid treatment data", 400, request);
    }

  } catch (error) {
    console.error("Error creating treatment:", error);
    return createSecureErrorResponse("Failed to create treatment", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
