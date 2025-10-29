import { prisma } from "@/lib/prisma";

/**
 * Simple Production Balance Service
 * Uses ProductionSummary model for balance tracking
 */

export interface DayBalance {
  date: Date;
  totalProduction: number;
  totalCalfFed: number;
  netProduction: number;
  totalSales: number;
  finalBalance: number;
  balanceYesterday: number;
}

/**
 * Calculate daily balance using EXACT same logic as sales stats
 */
export async function calculateDayBalance(date: Date): Promise<DayBalance> {
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

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
        calf_quantity_fed_am: true,
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
        calf_quantity_fed_pm: true,
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
    },
  });

  const totalMorningProduction = morningProduction._sum.quantity_am || 0;
  const totalEveningProduction = eveningProduction._sum.quantity_pm || 0;
  const totalProduction = totalMorningProduction + totalEveningProduction;
  
  const totalCalfFed = (morningProduction._sum.calf_quantity_fed_am || 0) + (eveningProduction._sum.calf_quantity_fed_pm || 0);
  const netProduction = totalProduction - totalCalfFed;
  
  // Get morning total with yesterday's balance included (EXACT same as sales stats)
  const morningTotalWithBalance = await getMorningTotalWithBalance(startOfDay);
  const availableEvening = eveningProduction._sum.balance_pm || 0;
  const totalAvailableBalance = morningTotalWithBalance + availableEvening;
  
  const totalSales = salesAggregation._sum.quantity || 0;
  const finalBalance = totalAvailableBalance - totalSales;

  // Get yesterday's balance for reporting (same as before for backward compatibility)
  const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
  const yesterdaySummary = await prisma.productionSummary.findUnique({
    where: { date: yesterday }
  });
  const balanceYesterday = yesterdaySummary?.final_balance || 0;

  return {
    date: startOfDay,
    totalProduction,
    totalCalfFed,
    netProduction,
    totalSales,
    finalBalance,
    balanceYesterday,
  };
}

/**
 * Update or create daily summary with balance
 */
export async function updateDaySummary(date: Date): Promise<void> {
  const dayBalance = await calculateDayBalance(date);
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

  await prisma.productionSummary.upsert({
    where: { date: startOfDay },
    create: {
      date: startOfDay,
      final_balance: dayBalance.finalBalance,
    },
    update: {
      final_balance: dayBalance.finalBalance,
    }
  });
}

/**
 * Get available milk for sales with FIFO deduction logic (deduct from yesterday's balance first)
 */
export async function getAvailableMilkForSales(date: Date): Promise<{
  balanceYesterday: number;
  todayNetProduction: number;
  totalAvailable: number;
  totalSold: number;
  remainingBalance: number;
  remainingFromYesterday: number;
  remainingFromToday: number;
}> {
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  
  const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
  const yesterdaySummary = await prisma.productionSummary.findUnique({ where: { date: yesterday } });
  
  let balanceYesterday = 0;
  if (!yesterdaySummary) {
    try {
      const yesterdayBalance = await calculateDayBalance(yesterday);
      balanceYesterday = yesterdayBalance.finalBalance || 0;
    } catch (err) {
      console.error("Failed to compute yesterday's balance:", err);
      balanceYesterday = 0;
    }
  } else {
    balanceYesterday = yesterdaySummary.final_balance || 0;
  }
  
  // Get today's production (morning + evening)
  const [morningProductions, eveningProductions] = await Promise.all([
    prisma.morningProduction.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        animal: { type: { not: "CALF" } }
      }
    }),
    prisma.eveningProduction.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        animal: { type: { not: "CALF" } }
      }
    })
  ]);
  
  const morningTotal = morningProductions.reduce((sum, record) => sum + (record.quantity_am || 0), 0);
  const morningCalfFed = morningProductions.reduce((sum, record) => sum + (record.calf_quantity_fed_am || 0), 0);
  const eveningTotal = eveningProductions.reduce((sum, record) => sum + (record.quantity_pm || 0), 0);
  const eveningCalfFed = eveningProductions.reduce((sum, record) => sum + (record.calf_quantity_fed_pm || 0), 0);
  
  const morningNet = morningTotal - morningCalfFed;
  const eveningNet = eveningTotal - eveningCalfFed;
  const todayNetProduction = morningNet + eveningNet;

  const totalAvailable = balanceYesterday + todayNetProduction;

  const salesTotal = await prisma.sales.aggregate({
    where: {
      timeRecorded: { gte: startOfDay, lt: endOfDay }
    },
    _sum: { quantity: true }
  });
  const totalSold = salesTotal._sum.quantity || 0;
  
  let remainingFromYesterday = balanceYesterday;
  let remainingFromToday = todayNetProduction;
  
  if (totalSold > 0) {
    if (totalSold <= balanceYesterday) {
      remainingFromYesterday = balanceYesterday - totalSold;
      remainingFromToday = todayNetProduction;
    } else {
      const salesFromToday = totalSold - balanceYesterday;
      remainingFromYesterday = 0;
      remainingFromToday = Math.max(0, todayNetProduction - salesFromToday);
    }
  }
  
  const remainingBalance = remainingFromYesterday + remainingFromToday;
  
  return {
    balanceYesterday,
    todayNetProduction,
    totalAvailable,
    totalSold,
    remainingBalance,
    remainingFromYesterday,
    remainingFromToday,
  };
}

/**
 * Update the morning production calculation logic to include yesterday's balance
 * This function ensures yesterday's final balance is automatically included in today's available milk
 */
export async function addBalanceToMorningProduction(date: Date): Promise<{
  success: boolean;
  balanceAdded: number;
  message: string;
}> {
  try {
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

    const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

    const yesterdaySummary = await prisma.productionSummary.findUnique({
      where: { date: yesterday },
    });

    const finalBalance = yesterdaySummary?.final_balance || 0;

    if (finalBalance <= 0) {
      return {
        success: true,
        balanceAdded: 0,
        message: "No balance to carry over (previous day's final balance is zero or negative)",
      };
    }

    return {
      success: true,
      balanceAdded: finalBalance,
      message: `${finalBalance}L will be included in today's morning production total (calculated, no DB record created)`,
    };

  } catch (error) {
    console.error("Error processing balance carryover:", error);
    return {
      success: false,
      balanceAdded: 0,
      message: `Failed to process balance carryover: ${error}`
    };
  }
}

/**
 * Get morning production total including yesterday's balance
 */
export async function getMorningTotalWithBalance(date: Date): Promise<number> {
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

  const morningProductions = await prisma.morningProduction.findMany({
    where: {
      date: { gte: startOfDay, lt: endOfDay },
      animal: { type: { not: "CALF" } },
    },
  });

  const morningTotal = morningProductions.reduce((sum, record) => sum + (record.quantity_am || 0), 0);
  const morningCalfFed = morningProductions.reduce((sum, record) => sum + (record.calf_quantity_fed_am || 0), 0);
  const morningNet = morningTotal - morningCalfFed;

  const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

  let balanceYesterday = 0;
  let yesterdaySummary = await prisma.productionSummary.findUnique({ where: { date: yesterday } });

  if (!yesterdaySummary) {
    try {
      const yesterdayStart = new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 0, 0, 0, 0));
      const yesterdayEnd = new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 23, 59, 59, 999));
      const [yesterdayMorning, yesterdayEvening] = await Promise.all([
        prisma.morningProduction.findMany({
          where: { date: { gte: yesterdayStart, lt: yesterdayEnd }, animal: { type: { not: "CALF" } } }
        }),
        prisma.eveningProduction.findMany({
          where: { date: { gte: yesterdayStart, lt: yesterdayEnd }, animal: { type: { not: "CALF" } } }
        })
      ]);
      
      const yesterdayMorningTotal = yesterdayMorning.reduce((sum, record) => sum + (record.quantity_am || 0), 0);
      const yesterdayMorningCalfFed = yesterdayMorning.reduce((sum, record) => sum + (record.calf_quantity_fed_am || 0), 0);
      const yesterdayEveningTotal = yesterdayEvening.reduce((sum, record) => sum + (record.quantity_pm || 0), 0);
      const yesterdayEveningCalfFed = yesterdayEvening.reduce((sum, record) => sum + (record.calf_quantity_fed_pm || 0), 0);
      
      const yesterdayNetProduction = (yesterdayMorningTotal - yesterdayMorningCalfFed) + (yesterdayEveningTotal - yesterdayEveningCalfFed);

      const yesterdaySalesTotal = await prisma.sales.aggregate({
        where: { timeRecorded: { gte: yesterdayStart, lt: yesterdayEnd } },
        _sum: { quantity: true }
      });
      const yesterdaySales = yesterdaySalesTotal._sum.quantity || 0;
      
      const dayBeforeYesterday = new Date(yesterdayStart.getTime() - 24 * 60 * 60 * 1000);
      const dayBeforeYesterdaySummary = await prisma.productionSummary.findUnique({ where: { date: dayBeforeYesterday } });
      const dayBeforeBalance = dayBeforeYesterdaySummary?.final_balance || 0;
      
      balanceYesterday = dayBeforeBalance + yesterdayNetProduction - yesterdaySales;
    } catch (err) {
      console.error("Failed to compute yesterday's balance on the fly:", err);
      balanceYesterday = 0;
    }
  } else {
    balanceYesterday = yesterdaySummary.final_balance || 0;
  }

  const totalWithBalance = morningNet + balanceYesterday;

  return totalWithBalance;
}