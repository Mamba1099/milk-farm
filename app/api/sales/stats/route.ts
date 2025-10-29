import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { getMorningTotalWithBalance } from "@/lib/services/production-balance";

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
    const date = searchParams.get("date") || (() => {
      const localToday = new Date();
      return new Date(Date.UTC(localToday.getFullYear(), localToday.getMonth(), localToday.getDate())).toISOString().split('T')[0];
    })();
    
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    const [morningProduction, eveningProduction] = await Promise.all([
      prisma.morningProduction.aggregate({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          animal: {
            type: {
              not: "CALF"
            }
          }
        },
        _sum: {
          quantity_am: true,
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
              not: "CALF"
            }
          }
        },
        _sum: {
          quantity_pm: true,
          balance_pm: true,
        },
      }),
    ]);

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

    const totalMorningProduction = morningProduction._sum.quantity_am || 0;
    const totalEveningProduction = eveningProduction._sum.quantity_pm || 0;
    const totalProduction = totalMorningProduction + totalEveningProduction;
    
    // Get morning total with yesterday's balance included
    const morningTotalWithBalance = await getMorningTotalWithBalance(startOfDay);
    const availableEvening = eveningProduction._sum.balance_pm || 0;
    const totalAvailableBalance = morningTotalWithBalance + availableEvening;
    
    const totalSales = salesAggregation._sum.quantity || 0;
    const revenue = salesAggregation._sum.totalAmount || 0;
    const balanceRemaining = totalAvailableBalance - totalSales;

    const responseData = {
      totalProduction,
      totalSales,
      balanceRemaining: Math.max(0, balanceRemaining),
      revenue,
    };

    return createSecureResponse(responseData, {}, request);
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return createSecureErrorResponse("Failed to fetch sales statistics", 500, request);
  }
}