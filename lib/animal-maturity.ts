import { prisma } from "@/lib/prisma";

/**
 * Updates animal maturity status based on expected maturity date
 * This function should be called periodically (e.g., daily cron job)
 */
export async function updateAnimalMaturityStatus() {
  try {
    const now = new Date();

    // Find animals that have passed their expected maturity date but are not yet marked as ready for production
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

    // Update each animal
    for (const animal of animalsToUpdate) {
      const updates: {
        isMatured: boolean;
        type?: "COW" | "BULL" | "CALF";
        isReadyForProduction?: boolean;
      } = {
        isMatured: true,
      };

      // If the animal is a calf and has matured, upgrade it to a cow
      if (animal.type === "CALF") {
        updates.type = "COW";
      }

      // Mark female cows as ready for production
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
      // Calves mature at 18-24 months, we'll use 20 months as average
      maturityDate.setMonth(maturityDate.getMonth() + 20);
      break;
    case "COW":
    case "BULL":
      // If they're already classified as cow/bull, they should be mature
      // But we'll add 6 months as a safety buffer
      maturityDate.setMonth(maturityDate.getMonth() + 6);
      break;
    default:
      // Default to 20 months
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

    // Get all production records for today
    const todayProductions = await prisma.production.findMany({
      where: {
        date: today,
      },
    });

    console.log(
      `Processing carry-over for ${todayProductions.length} production records`
    );

    // Calculate carry-over for each production record
    for (const production of todayProductions) {
      // Get total sales for this animal today
      const totalSales = await prisma.sales.aggregate({
        where: {
          animalId: production.animalId,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const soldQuantity = totalSales._sum.quantity || 0;
      const remainingQuantity = Math.max(
        0,
        production.availableForSales - soldQuantity
      );

      // Update the production record with carry-over quantity
      if (remainingQuantity > 0) {
        await prisma.production.update({
          where: { id: production.id },
          data: {
            carryOverQuantity: remainingQuantity,
          },
        });

        console.log(
          `Set carry-over of ${remainingQuantity}L for animal ${production.animalId}`
        );
      }
    }

    return {
      success: true,
      processed: todayProductions.length,
    };
  } catch (error) {
    console.error("Error updating production carry-over:", error);
    throw error;
  }
}
