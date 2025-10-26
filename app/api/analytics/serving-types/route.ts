import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all servings with their types and outcomes
    const allServings = await prisma.serving.findMany({
      select: {
        servingType: true,
        outcome: true,
        ovaType: true,
        dateServed: true,
      },
    });

    if (allServings.length === 0) {
      // Return empty data if no servings exist
      return NextResponse.json([]);
    }

    // Group by serving type and calculate statistics
    const servingTypeStats = allServings.reduce((acc: any, serving) => {
      const type = serving.servingType;
      
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          successful: 0,
          failed: 0,
          pending: 0,
          predetermined: 0,
          normal: 0,
        };
      }

      acc[type].total += 1;
      
      // Count outcomes
      if (serving.outcome === 'SUCCESSFUL') acc[type].successful += 1;
      else if (serving.outcome === 'FAILED') acc[type].failed += 1;
      else if (serving.outcome === 'PENDING') acc[type].pending += 1;

      // Count ova types
      if (serving.ovaType === 'PREDETERMINED') acc[type].predetermined += 1;
      else acc[type].normal += 1;

      return acc;
    }, {});

    // Calculate total servings for percentage calculation
    const totalServings = allServings.length;

    // Format data for chart
    const data = Object.entries(servingTypeStats).map(([type, stats]: [string, any]) => {
      const successRate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
      const percentage = totalServings > 0 ? (stats.total / totalServings) * 100 : 0;

      return {
        type,
        count: stats.total,
        successfulCount: stats.successful,
        failedCount: stats.failed,
        pendingCount: stats.pending,
        successRate: Math.round(successRate * 10) / 10,
        percentage: Math.round(percentage * 10) / 10,
        predeterminedCount: stats.predetermined,
        normalCount: stats.normal,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching serving types:", error);
    return NextResponse.json(
      { error: "Failed to fetch serving types" },
      { status: 500 }
    );
  }
}