import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];
    
    // Parse date to get start and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get total production for the day (sum of balance_am and balance_pm from productive animals only)
    const [morningProduction, eveningProduction] = await Promise.all([
      prisma.morningProduction.aggregate({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          animal: {
            type: {
              not: "CALF" // Exclude calf records from balance calculation
            }
          }
        },
        _sum: {
          balance_am: true,
        },
      }),
      prisma.eveningProduction.aggregate({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          animal: {
            type: {
              not: "CALF" // Exclude calf records from balance calculation
            }
          }
        },
        _sum: {
          balance_pm: true,
        },
      }),
    ]);

    // Get total sales for the day
    const salesAggregation = await prisma.sales.aggregate({
      where: {
        timeRecorded: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        quantity: true,
        totalAmount: true,
      },
    });

    // Calculate totals
    const totalMorningProduction = morningProduction._sum.balance_am || 0;
    const totalEveningProduction = eveningProduction._sum.balance_pm || 0;
    const totalProduction = totalMorningProduction + totalEveningProduction;
    
    const totalSales = salesAggregation._sum.quantity || 0;
    const revenue = salesAggregation._sum.totalAmount || 0;
    const balanceRemaining = totalProduction - totalSales;

    return createSecureResponse({
      totalProduction,
      totalSales,
      balanceRemaining: Math.max(0, balanceRemaining), // Ensure non-negative
      revenue,
    }, {}, request);
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return createSecureErrorResponse("Failed to fetch sales statistics", 500, request);
  }
}