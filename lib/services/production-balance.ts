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
 * Calculate daily balance using existing ProductionSummary
 */
export async function calculateDayBalance(date: Date): Promise<DayBalance> {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

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
  const eveningTotal = eveningProductions.reduce((sum, record) => sum + (record.quantity_pm || 0), 0);
  const totalProduction = morningTotal + eveningTotal;

  const morningCalfFed = morningProductions.reduce((sum, record) => sum + (record.calf_quantity_fed_am || 0), 0);
  const eveningCalfFed = eveningProductions.reduce((sum, record) => sum + (record.calf_quantity_fed_pm || 0), 0);
  const totalCalfFed = morningCalfFed + eveningCalfFed;

  const netProduction = totalProduction - totalCalfFed;

  const salesTotal = await prisma.sales.aggregate({
    where: {
      timeRecorded: { gte: startOfDay, lt: endOfDay }
    },
    _sum: { quantity: true }
  });
  const totalSales = salesTotal._sum.quantity || 0;

  const yesterday = new Date(startOfDay);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdaySummary = await prisma.productionSummary.findUnique({
    where: { date: yesterday }
  });
  const balanceYesterday = yesterdaySummary?.final_balance || 0;

  const finalBalance = balanceYesterday + netProduction - totalSales;

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
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

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
 * Get available milk for sales (including yesterday's balance)
 */
export async function getAvailableMilkForSales(date: Date): Promise<{
  balanceYesterday: number;
  todayNetProduction: number;
  totalAvailable: number;
  totalSold: number;
  remainingBalance: number;
}> {
  const dayBalance = await calculateDayBalance(date);

  const totalAvailable = dayBalance.balanceYesterday + dayBalance.netProduction;
  const remainingBalance = totalAvailable - dayBalance.totalSales;

  return {
    balanceYesterday: dayBalance.balanceYesterday,
    todayNetProduction: dayBalance.netProduction,
    totalAvailable,
    totalSold: dayBalance.totalSales,
    remainingBalance,
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
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);

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
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const morningProductions = await prisma.morningProduction.findMany({
    where: {
      date: { gte: startOfDay, lt: endOfDay },
      animal: { type: { not: "CALF" } },
    },
  });

  const morningTotal = morningProductions.reduce((sum, record) => sum + (record.quantity_am || 0), 0);
  const morningCalfFed = morningProductions.reduce((sum, record) => sum + (record.calf_quantity_fed_am || 0), 0);
  const morningNet = morningTotal - morningCalfFed;

  const yesterday = new Date(startOfDay);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaySummary = await prisma.productionSummary.findUnique({ where: { date: yesterday } });
  const balanceYesterday = yesterdaySummary?.final_balance || 0;

  return morningNet + balanceYesterday;
}