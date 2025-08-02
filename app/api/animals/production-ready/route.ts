import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

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

    const animals = await prisma.animal.findMany({
      where: {
        isReadyForProduction: true,
        type: "COW",
        gender: "FEMALE",
        disposals: {
          none: {},
        },
      },
      select: {
        id: true,
        tagNumber: true,
        name: true,
        type: true,
        gender: true,
        birthDate: true,
        expectedMaturityDate: true,
        image: true,
        isMatured: true,
        isReadyForProduction: true,
        motherOf: {
          where: {
            type: "CALF",
            disposals: {
              none: {},
            },
          },
          select: {
            id: true,
            tagNumber: true,
            name: true,
            birthDate: true,
            image: true,
          },
        },
      },
      orderBy: {
        tagNumber: "asc",
      },
    });

    return createSecureResponse({
      animals,
      total: animals.length,
    }, {}, request);
  } catch (error) {
    return createSecureErrorResponse("Failed to fetch production-ready animals", 500, request);
  }
}
