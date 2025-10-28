import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
      return createSecureErrorResponse("Unauthorized", 401, request);
    }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const morningProduction = await prisma.morningProduction.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        date: true,
        quantity_am: true,
        calf_quantity_fed_am: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const eveningProduction = await prisma.eveningProduction.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        date: true,
        quantity_pm: true,
        calf_quantity_fed_pm: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const daysInMonth = [];
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const currentDate = new Date(now.getFullYear(), now.getMonth(), day);
      daysInMonth.push({
        date: currentDate.toISOString().split('T')[0],
        displayDate: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        morningProduction: 0,
        eveningProduction: 0,
        totalProduction: 0,
        calfFeedingAM: 0,
        calfFeedingPM: 0,
      });
    }

    const productionByDate = new Map();
    daysInMonth.forEach(day => {
      productionByDate.set(day.date, day);
    });

    morningProduction.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (productionByDate.has(dateKey)) {
        const entry = productionByDate.get(dateKey);
        entry.morningProduction += record.quantity_am || 0;
        entry.calfFeedingAM += record.calf_quantity_fed_am || 0;
      }
    });

    eveningProduction.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (productionByDate.has(dateKey)) {
        const entry = productionByDate.get(dateKey);
        entry.eveningProduction += record.quantity_pm || 0;
        entry.calfFeedingPM += record.calf_quantity_fed_pm || 0;
      }
    });

    const data = Array.from(productionByDate.values()).map(entry => {
      entry.totalProduction = entry.morningProduction + entry.eveningProduction;
      const dayNumber = new Date(entry.date).getDate();
      return {
        date: dayNumber.toString(),
        fullDate: entry.displayDate,
        morningProduction: Math.round(entry.morningProduction * 100) / 100,
        eveningProduction: Math.round(entry.eveningProduction * 100) / 100,
        totalProduction: Math.round(entry.totalProduction * 100) / 100,
        calfFeedingAM: Math.round(entry.calfFeedingAM * 100) / 100,
        calfFeedingPM: Math.round(entry.calfFeedingPM * 100) / 100,
      };
    });

    return createSecureResponse(data, {}, request);
  } catch (error) {
    console.error("Error fetching daily production:", error);
    return createSecureErrorResponse("Failed to fetch daily production data", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }
  
  return createSecureResponse({ message: "OK" }, { status: 200 }, request);
}