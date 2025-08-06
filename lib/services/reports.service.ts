import { prisma } from "@/lib/prisma";
import { createSecureResponse, createSecureErrorResponse } from "@/lib/security";

export async function getProductionReport(startDate: Date, endDate: Date) {
  try {
    const productionData = await prisma.production.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        animal: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
            type: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const summary = {
      totalRecords: productionData.length,
      totalMilkProduced: productionData.reduce((sum, record) => sum + record.morningQuantity + record.eveningQuantity, 0),
      averageDailyProduction: productionData.length > 0 
        ? productionData.reduce((sum, record) => sum + record.morningQuantity + record.eveningQuantity, 0) / productionData.length 
        : 0,
      totalAvailableForSales: productionData.reduce((sum, record) => sum + record.availableForSales, 0),
    };

    return createSecureResponse({
      data: productionData,
      summary,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating production report:", error);
    return createSecureErrorResponse("Failed to generate production report", 500);
  }
}

export async function getAnimalsReport(startDate: Date, endDate: Date) {
  try {
    const animals = await prisma.animal.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        treatments: {
          where: {
            treatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        productionRecords: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        disposals: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const summary = {
      totalAnimals: animals.length,
      healthyAnimals: animals.filter(animal => animal.healthStatus === 'HEALTHY').length,
      sickAnimals: animals.filter(animal => animal.healthStatus === 'SICK').length,
      matureAnimals: animals.filter(animal => animal.isMatured).length,
      productionReadyAnimals: animals.filter(animal => animal.isReadyForProduction).length,
      disposedAnimals: animals.filter(animal => animal.disposals.length > 0).length,
      animalsByType: {
        COW: animals.filter(animal => animal.type === 'COW').length,
        BULL: animals.filter(animal => animal.type === 'BULL').length,
        CALF: animals.filter(animal => animal.type === 'CALF').length,
      },
    };

    return createSecureResponse({
      data: animals,
      summary,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating animals report:", error);
    return createSecureErrorResponse("Failed to generate animals report", 500);
  }
}

export async function getTreatmentsReport(startDate: Date, endDate: Date) {
  try {
    const treatments = await prisma.treatment.findMany({
      where: {
        treatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        animal: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
            type: true,
            healthStatus: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        treatedAt: 'desc',
      },
    });

    const summary = {
      totalTreatments: treatments.length,
      uniqueAnimalsTreated: new Set(treatments.map(t => t.animalId)).size,
      treatmentsByAnimalType: {
        COW: treatments.filter(t => t.animal.type === 'COW').length,
        BULL: treatments.filter(t => t.animal.type === 'BULL').length,
        CALF: treatments.filter(t => t.animal.type === 'CALF').length,
      },
    };

    return createSecureResponse({
      data: treatments,
      summary,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating treatments report:", error);
    return createSecureErrorResponse("Failed to generate treatments report", 500);
  }
}

// Overview Report
export async function getOverviewReport(startDate: Date, endDate: Date) {
  try {
    const [
      productionCount,
      animalsCount,
      treatmentsCount,
      salesCount,
      servingsCount,
    ] = await Promise.all([
      prisma.production.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.animal.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.treatment.count({
        where: {
          treatedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.sales.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.serving.count({
        where: {
          servedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    const totalMilkProduction = await prisma.production.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        morningQuantity: true,
        eveningQuantity: true,
        availableForSales: true,
      },
    });

    const totalSales = await prisma.sales.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        quantity: true,
        totalAmount: true,
      },
    });

    const overview = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      production: {
        recordsCount: productionCount,
        totalMilk: (totalMilkProduction._sum?.morningQuantity || 0) + (totalMilkProduction._sum?.eveningQuantity || 0),
        availableForSales: totalMilkProduction._sum?.availableForSales || 0,
      },
      animals: {
        newAnimals: animalsCount,
        treatmentsGiven: treatmentsCount,
        servingsRecorded: servingsCount,
      },
      sales: {
        recordsCount: salesCount,
        totalQuantitySold: totalSales._sum.quantity || 0,
        totalRevenue: totalSales._sum.totalAmount || 0,
      },
    };

    return createSecureResponse({
      data: overview,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating overview report:", error);
    return createSecureErrorResponse("Failed to generate overview report", 500);
  }
}
