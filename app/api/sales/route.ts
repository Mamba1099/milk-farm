import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { CreateSalesSchema } from "@/lib/validators/sales";
import { getAvailableMilkForSales, updateDaySummary } from "@/lib/services/production-balance";

export async function GET(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || !["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.SalesWhereInput = {};

    if (date) {
      let startOfDay: Date;
      let endOfDay: Date;
      
      if (date.includes('T')) {
        const dateObj = new Date(date);
        startOfDay = new Date(Date.UTC(
          dateObj.getUTCFullYear(),
          dateObj.getUTCMonth(),
          dateObj.getUTCDate(),
          0, 0, 0, 0
        ));
        endOfDay = new Date(Date.UTC(
          dateObj.getUTCFullYear(),
          dateObj.getUTCMonth(),
          dateObj.getUTCDate(),
          23, 59, 59, 999
        ));
      } else {
        const [year, month, day] = date.split('-').map(Number);
        startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      }

      where.timeRecorded = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate && endDate) {
      let gteDate: Date;
      let lteDate: Date;
      
      if (startDate.includes('T')) {
        gteDate = new Date(startDate);
      } else {
        const [year, month, day] = startDate.split('-').map(Number);
        gteDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      }
      
      if (endDate.includes('T')) {
        lteDate = new Date(endDate);
      } else {
        const [year, month, day] = endDate.split('-').map(Number);
        lteDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      }

      where.timeRecorded = {
        gte: gteDate,
        lte: lteDate,
      };
    }

    const [sales, total] = await Promise.all([
      prisma.sales.findMany({
        where,
        include: {
          soldBy: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          timeRecorded: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.sales.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return createSecureResponse({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }, {}, request);
  } catch (error) {
    console.error("Error fetching sales records:", error);
    return createSecureErrorResponse("Failed to fetch sales records", 500, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || !["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const PaymentMethodEnum = ["CASH", "MPESA"];
    const validatedData = CreateSalesSchema.parse({
      ...body,
      date: new Date().toISOString(),
      payment_method: PaymentMethodEnum.includes(body.payment_method) ? body.payment_method : "CASH"
    });

    const salesDate = new Date(validatedData.date);
    const timeRecorded = new Date();
    const totalAmount = validatedData.totalAmount;

    const availableMilk = await getAvailableMilkForSales(salesDate);
    const requestedQuantity = validatedData.quantity;
    
    // Debug logging for sales balance calculation
    console.log("=== SALES BALANCE DEBUG ===");
    console.log(`Sales Date: ${salesDate.toISOString().split('T')[0]}`);
    console.log(`Available Milk Data:`, JSON.stringify(availableMilk, null, 2));
    console.log(`Requested Quantity: ${requestedQuantity}L`);
    console.log(`Balance Calculation: ${availableMilk.balanceYesterday}L (yesterday) + ${availableMilk.todayNetProduction}L (today net) - ${availableMilk.totalSold}L (sold) = ${availableMilk.remainingBalance}L (available)`);
    console.log("==========================");
    
    if (requestedQuantity > availableMilk.remainingBalance) {
      return createSecureErrorResponse(
        `Insufficient milk available. Available: ${availableMilk.remainingBalance}L (Yesterday's balance: ${availableMilk.balanceYesterday}L + Today's net production: ${availableMilk.todayNetProduction}L - Already sold: ${availableMilk.totalSold}L)`, 
        400, 
        request
      );
    }

    const sales = await prisma.sales.create({
      data: {
        timeRecorded,
        quantity: validatedData.quantity,
        totalAmount,
        soldById: user.id,
        customerName: validatedData.customerName,
        payment_method: validatedData.payment_method as "CASH" | "MPESA",
      },
      include: {
        soldBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    await updateDaySummary(salesDate);

    return createSecureResponse({
      message: "Sales record created successfully",
      sales,
    }, { status: 201 }, request);
  } catch (error) {
    console.error("Error creating sales record:", error);

    if (error instanceof z.ZodError) {
      return createSecureErrorResponse(error.errors[0].message, 400, request);
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create sales record";
    return createSecureErrorResponse(errorMessage, 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }
  
  return createSecureResponse({ message: "OK" }, { status: 200 }, request);
}


