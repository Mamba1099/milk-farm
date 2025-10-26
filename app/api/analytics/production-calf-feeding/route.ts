import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) return securityError;

  const user = await getUserFromSession(request);
  if (!user) {
    return createSecureErrorResponse("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get calf feeding data from morning and evening production
    const [morningFeeding, eveningFeeding] = await Promise.all([
      prisma.morningProduction.findMany({
        where: {
          date: { gte: startDate },
          calf_quantity_fed_am: { gt: 0 }
        },
        include: { animal: true },
        orderBy: { date: "desc" }
      }),
      prisma.eveningProduction.findMany({
        where: {
          date: { gte: startDate },
          calf_quantity_fed_pm: { gt: 0 }
        },
        include: { animal: true },
        orderBy: { date: "desc" }
      })
    ]);

    // Aggregate daily calf feeding data
    const dailyData = new Map();

    morningFeeding.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, { date: dateKey, morningFed: 0, eveningFed: 0, total: 0 });
      }
      const day = dailyData.get(dateKey);
      day.morningFed += record.calf_quantity_fed_am || 0;
      day.total += record.calf_quantity_fed_am || 0;
    });

    eveningFeeding.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, { date: dateKey, morningFed: 0, eveningFed: 0, total: 0 });
      }
      const day = dailyData.get(dateKey);
      day.eveningFed += record.calf_quantity_fed_pm || 0;
      day.total += record.calf_quantity_fed_pm || 0;
    });

    const chartData = Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate summary statistics
    const totalFed = chartData.reduce((sum, day) => sum + day.total, 0);
    const avgDaily = totalFed / Math.max(chartData.length, 1);

    return createSecureResponse({
      data: chartData,
      summary: {
        totalFed,
        avgDaily: Math.round(avgDaily * 100) / 100,
        daysTracked: chartData.length
      }
    });
  } catch (error) {
    console.error("Error fetching calf feeding analytics:", error);
    return createSecureErrorResponse("Internal Server Error", 500);
  }
}
