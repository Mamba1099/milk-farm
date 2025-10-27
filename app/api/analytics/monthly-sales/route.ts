import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    const salesData = await prisma.sales.findMany({
      where: {
        timeRecorded: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        timeRecorded: true,
        quantity: true,
        totalAmount: true,
      },
      orderBy: {
        timeRecorded: 'asc',
      },
    });

    const monthlyData: { month: string; monthNumber: number; totalQuantity: number; totalRevenue: number; }[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let month = 0; month < 12; month++) {
      monthlyData.push({
        month: monthNames[month],
        monthNumber: month + 1,
        totalQuantity: 0,
        totalRevenue: 0,
      });
    }

    salesData.forEach(record => {
      const recordMonth = record.timeRecorded.getMonth();
      monthlyData[recordMonth].totalQuantity += record.quantity || 0;
      monthlyData[recordMonth].totalRevenue += record.totalAmount || 0;
    });

    const data = monthlyData.map(entry => ({
      month: entry.month,
      monthNumber: entry.monthNumber,
      totalQuantity: Math.round(entry.totalQuantity * 100) / 100,
      totalRevenue: Math.round(entry.totalRevenue * 100) / 100,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly sales data" },
      { status: 500 }
    );
  }
}