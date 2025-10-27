import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    const morningProduction = await prisma.morningProduction.findMany({
      where: {
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
        animal: {
          type: { not: "CALF" }
        }
      },
      select: {
        date: true,
        quantity_am: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const eveningProduction = await prisma.eveningProduction.findMany({
      where: {
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
        animal: {
          type: { not: "CALF" }
        }
      },
      select: {
        date: true,
        quantity_pm: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const monthlyData: {
      month: string;
      monthNumber: number;
      totalMorningProduction: number;
      totalEveningProduction: number;
      totalDailyProduction: number;
    }[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let month = 0; month < 12; month++) {
      monthlyData.push({
        month: monthNames[month],
        monthNumber: month + 1,
        totalMorningProduction: 0,
        totalEveningProduction: 0,
        totalDailyProduction: 0,
      });
    }

    morningProduction.forEach(record => {
      const recordMonth = record.date.getMonth();
      monthlyData[recordMonth].totalMorningProduction += record.quantity_am || 0;
    });

    eveningProduction.forEach(record => {
      const recordMonth = record.date.getMonth();
      monthlyData[recordMonth].totalEveningProduction += record.quantity_pm || 0;
    });

    const data = monthlyData.map(entry => ({
      month: entry.month,
      monthNumber: entry.monthNumber,
      totalMorningProduction: Math.round(entry.totalMorningProduction * 100) / 100,
      totalEveningProduction: Math.round(entry.totalEveningProduction * 100) / 100,
      totalDailyProduction: Math.round((entry.totalMorningProduction + entry.totalEveningProduction) * 100) / 100,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching monthly production:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly production data" },
      { status: 500 }
    );
  }
}