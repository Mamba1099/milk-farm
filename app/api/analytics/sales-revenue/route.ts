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
    const salesData = await prisma.sales.findMany({
      where: {
        timeRecorded: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        timeRecorded: true,
        totalAmount: true,
        quantity: true,
        customerName: true,
        payment_method: true,
      },
      orderBy: {
        timeRecorded: 'asc',
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
        totalRevenue: 0,
        totalQuantity: 0,
        salesCount: 0,
        averagePrice: 0,
        cashSales: 0,
        mpesaSales: 0,
      });
    }

    const revenueByDate = new Map();
    daysInMonth.forEach(day => {
      revenueByDate.set(day.date, day);
    });

    salesData.forEach(sale => {
      const dateKey = sale.timeRecorded.toISOString().split('T')[0];
      if (revenueByDate.has(dateKey)) {
        const entry = revenueByDate.get(dateKey);
        entry.totalRevenue += sale.totalAmount;
        entry.totalQuantity += sale.quantity;
        entry.salesCount += 1;
        
        if (sale.payment_method === 'CASH') {
          entry.cashSales += sale.totalAmount;
        } else if (sale.payment_method === 'MPESA') {
          entry.mpesaSales += sale.totalAmount;
        }
      }
    });

    const data = Array.from(revenueByDate.values()).map(entry => {
      const dayNumber = new Date(entry.date).getDate();
      return {
        date: dayNumber.toString(),
        fullDate: entry.displayDate,
        totalRevenue: Math.round(entry.totalRevenue * 100) / 100,
        totalQuantity: Math.round(entry.totalQuantity * 100) / 100,
        salesCount: entry.salesCount,
        averagePrice: entry.totalQuantity > 0 ? Math.round((entry.totalRevenue / entry.totalQuantity) * 100) / 100 : 0,
        cashSales: Math.round(entry.cashSales * 100) / 100,
        mpesaSales: Math.round(entry.mpesaSales * 100) / 100,
      };
    });

    return createSecureResponse(data, { status: 200 }, request);
  } catch (error) {
    console.error("Error fetching sales revenue:", error);
    return createSecureErrorResponse("Failed to fetch sales revenue data", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }
  return createSecureResponse(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
    request
  );
}