import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get serving outcomes distribution
    const servingOutcomes = await prisma.serving.groupBy({
      by: ['outcome'],
      _count: {
        id: true,
      },
    });

    // Calculate total servings for percentage calculation
    const totalServings = servingOutcomes.reduce((sum, outcome) => sum + outcome._count.id, 0);

    // Ensure all outcome types are represented
    const allOutcomes = ['SUCCESSFUL', 'FAILED', 'PENDING'] as const;
    const data = allOutcomes.map(outcomeType => {
      const found = servingOutcomes.find(outcome => outcome.outcome === outcomeType);
      const count = found?._count.id || 0;
      return {
        outcome: outcomeType,
        count,
        percentage: totalServings > 0 ? (count / totalServings) * 100 : 0,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching serving outcomes:", error);
    return NextResponse.json(
      { error: "Failed to fetch serving outcomes" },
      { status: 500 }
    );
  }
}