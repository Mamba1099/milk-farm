import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
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
      },
      orderBy: {
        tagNumber: "asc",
      },
    });

    const animalsWithImageUrl = animals.map(animal => ({
      ...animal,
      image: normalizeImageUrl(animal.image),
    }));

    return createSecureResponse({
      animals: animalsWithImageUrl,
      total: animalsWithImageUrl.length,
    }, {}, request);
  } catch (error) {
    return createSecureErrorResponse("Failed to fetch production-ready animals", 500, request);
  }
}
