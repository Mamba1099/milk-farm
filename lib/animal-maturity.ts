import { prisma } from "@/lib/prisma";

/**
 * Updates animal maturity status based on expected maturity date
 * This function should be called periodically (e.g., daily cron job)
 */
export async function updateAnimalMaturityStatus() {
  try {
    const now = new Date();
    const animalsToUpdate = await prisma.animal.findMany({
      where: {
        expectedMaturityDate: {
          lte: now,
        },
        isReadyForProduction: false,
        type: {
          in: ["CALF", "COW"],
        },
        gender: "FEMALE",
        disposals: {
          none: {},
        },
      },
    });

    console.log(
      `Found ${animalsToUpdate.length} animals to update maturity status`
    );

    for (const animal of animalsToUpdate) {
      const updates: {
        isMatured: boolean;
        type?: "COW" | "BULL" | "CALF";
        isReadyForProduction?: boolean;
      } = {
        isMatured: true,
      };

      if (animal.type === "CALF") {
        updates.type = "COW";
      }

      if (animal.gender === "FEMALE") {
        updates.isReadyForProduction = true;
      }

      await prisma.animal.update({
        where: { id: animal.id },
        data: updates,
      });

      console.log(
        `Updated animal ${animal.tagNumber}: ${JSON.stringify(updates)}`
      );
    }

    return {
      success: true,
      updated: animalsToUpdate.length,
      animals: animalsToUpdate.map((a) => ({
        id: a.id,
        tagNumber: a.tagNumber,
        name: a.name,
        previousType: a.type,
      })),
    };
  } catch (error) {
    console.error("Error updating animal maturity status:", error);
    throw error;
  }
}

/**
 * Calculates expected maturity date for an animal based on type and birth date
 */
export function calculateExpectedMaturityDate(
  birthDate: Date,
  type: "COW" | "BULL" | "CALF"
): Date {
  const maturityDate = new Date(birthDate);

  switch (type) {
    case "CALF":
      maturityDate.setMonth(maturityDate.getMonth() + 20);
      break;
    case "COW":
    case "BULL":
      maturityDate.setMonth(maturityDate.getMonth() + 6);
      break;
    default:
      maturityDate.setMonth(maturityDate.getMonth() + 20);
  }

  return maturityDate;
}

/**
 * Updates carry-over quantities for production records
 * This should be called at the end of each day
 */
export async function updateProductionCarryOver() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySummary = await prisma.productionSummary.findUnique({ where: { date: today } });
    if (!todaySummary) {
      return { success: false, message: "No production summary for today." };
    }

    const carryOver = todaySummary.balance_evening || 0;
    console.log(`Carry-over for today (balance_evening): ${carryOver}L`);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    await prisma.productionSummary.upsert({
      where: { date: tomorrow },
      update: { balance_yesterday: carryOver },
      create: { date: tomorrow, balance_yesterday: carryOver },
    });

    return {
      success: true,
      carryOver,
    };
  } catch (error) {
    console.error("Error updating production carry-over:", error);
    throw error;
  }
}
