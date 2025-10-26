import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get treatment expenses for the entire current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st of current year

    const treatmentExpenses = await prisma.treatment.findMany({
      where: {
        treatedAt: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      select: {
        cost: true,
        treatedAt: true,
        disease: true,
        medicine: true,
      },
      orderBy: {
        treatedAt: 'asc',
      },
    });

    // Initialize all 12 months with zero values
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, i, 1);
      const monthKey = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      return {
        key: monthKey,
        month: monthName,
        totalCost: 0,
        treatmentCount: 0,
        avgCost: 0,
      };
    });

    // Group by month and calculate totals
    const monthlyExpensesMap = treatmentExpenses.reduce((acc: any, treatment) => {
      const month = treatment.treatedAt.toISOString().slice(0, 7); // YYYY-MM format

      if (!acc[month]) {
        acc[month] = {
          totalCost: 0,
          treatmentCount: 0,
        };
      }

      acc[month].totalCost += treatment.cost;
      acc[month].treatmentCount += 1;

      return acc;
    }, {});

    // Merge actual data with all months template
    const monthlyExpenses = allMonths.map(monthTemplate => {
      const actualData = monthlyExpensesMap[monthTemplate.key];
      
      if (actualData) {
        return {
          month: monthTemplate.month,
          totalCost: Math.round(actualData.totalCost * 100) / 100,
          treatmentCount: actualData.treatmentCount,
          avgCost: actualData.treatmentCount > 0 ? 
            Math.round((actualData.totalCost / actualData.treatmentCount) * 100) / 100 : 0,
        };
      }
      
      return monthTemplate;
    });

    return NextResponse.json(monthlyExpenses);
  } catch (error) {
    console.error("Error fetching treatment expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch treatment expenses" },
      { status: 500 }
    );
  }
}