import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get serving data summary
    const servingsCount = await prisma.serving.count();
    const treatmentsCount = await prisma.treatment.count();
    const animalsCount = await prisma.animal.count();

    const servingsSample = await prisma.serving.findMany({
      take: 5,
      select: {
        id: true,
        servingType: true,
        outcome: true,
        ovaType: true,
        dateServed: true,
        bullName: true,
      },
      orderBy: {
        dateServed: 'desc',
      },
    });

    const treatmentsSample = await prisma.treatment.findMany({
      take: 5,
      select: {
        id: true,
        disease: true,
        medicine: true,
        cost: true,
        treatedAt: true,
      },
      orderBy: {
        treatedAt: 'desc',
      },
    });

    return NextResponse.json({
      summary: {
        servingsCount,
        treatmentsCount,
        animalsCount,
      },
      samples: {
        servings: servingsSample,
        treatments: treatmentsSample,
      },
    });
  } catch (error) {
    console.error("Error fetching database status:", error);
    return NextResponse.json(
      { error: "Failed to fetch database status" },
      { status: 500 }
    );
  }
}