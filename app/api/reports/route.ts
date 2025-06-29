import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiTimeout } from "@/lib/api-timeout";
import { verifyToken } from "@/lib/jwt-utils";

// Types for reports
interface AnimalInfo {
  tagNumber: string;
  name: string | null;
  type: string;
  healthStatus?: string;
}


async function handleGetReports(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const reportType = url.searchParams.get("type");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Parse dates
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const end = endDate ? new Date(endDate) : new Date(); // Default: now

    switch (reportType) {
      case "production":
        return await getProductionReport(start, end);
      case "animals":
        return await getAnimalsReport(start, end);
      case "treatments":
        return await getTreatmentsReport(start, end);
      case "overview":
        return await getOverviewReport(start, end);
      default:
        return NextResponse.json(
          {
            error:
              "Invalid report type. Supported types: production, animals, treatments, overview",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getProductionReport(startDate: Date, endDate: Date) {
  const productions = await prisma.production.findMany({
    where: {
      date: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    },
    include: {
      animal: {
        select: {
          tagNumber: true,
          name: true,
          type: true,
        },
      },
      recordedBy: {
        select: {
          username: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  // Calculate summary statistics
  const totalQuantity = productions.reduce((sum, p) => sum + p.total, 0);
  const averageDaily =
    totalQuantity /
    Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  const recordCount = productions.length;

  // Group by animal
  const byAnimal = productions.reduce(
    (acc, prod) => {
      const key = prod.animal.tagNumber;
      if (!acc[key]) {
        acc[key] = {
          animal: prod.animal,
          totalQuantity: 0,
          recordCount: 0,
          productions: [],
        };
      }
      acc[key].totalQuantity += prod.total;
      acc[key].recordCount += 1;
      acc[key].productions.push(prod);
      return acc;
    },
    {} as Record<
      string,
      {
        animal: AnimalInfo;
        totalQuantity: number;
        recordCount: number;
        productions: typeof productions;
      }
    >
  );

  return NextResponse.json({
    message: "Production report generated successfully",
    report: {
      type: "production",
      period: { startDate, endDate },
      summary: {
        totalQuantity,
        averageDaily: Math.round(averageDaily * 100) / 100,
        recordCount,
      },
      byAnimal: Object.values(byAnimal),
      details: productions,
    },
  });
}

async function getAnimalsReport(startDate: Date, endDate: Date) {
  const animals = await prisma.animal.findMany({
    include: {
      productionRecords: {
        where: {
          date: {
            gte: startDate.toISOString(),
            lte: endDate.toISOString(),
          },
        },
      },
      treatments: {
        where: {
          treatedAt: {
            gte: startDate.toISOString(),
            lte: endDate.toISOString(),
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate statistics
  const totalAnimals = animals.length;
  const healthyAnimals = animals.filter(
    (a) => a.healthStatus === "HEALTHY"
  ).length;
  const sickAnimals = animals.filter((a) => a.healthStatus === "SICK").length;
  const injuredAnimals = animals.filter(
    (a) => a.healthStatus === "RECOVERING" || a.healthStatus === "QUARANTINED"
  ).length;

  const byType = animals.reduce((acc, animal) => {
    acc[animal.type] = (acc[animal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    message: "Animals report generated successfully",
    report: {
      type: "animals",
      period: { startDate, endDate },
      summary: {
        totalAnimals,
        healthyAnimals,
        sickAnimals,
        injuredAnimals,
        byType,
      },
      details: animals.map((animal) => ({
        ...animal,
        productionCount: animal.productionRecords.length,
        treatmentCount: animal.treatments.length,
        totalProduction: animal.productionRecords.reduce(
          (sum, p) => sum + p.total,
          0
        ),
      })),
    },
  });
}

async function getTreatmentsReport(startDate: Date, endDate: Date) {
  const treatments = await prisma.treatment.findMany({
    where: {
      treatedAt: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    },
    include: {
      animal: {
        select: {
          tagNumber: true,
          name: true,
          type: true,
          healthStatus: true,
        },
      },
    },
    orderBy: { treatedAt: "desc" },
  });

  // Calculate statistics
  const totalTreatments = treatments.length;
  const totalCost = treatments.reduce((sum, t) => sum + (t.cost || 0), 0);

  const byType = treatments.reduce((acc, treatment) => {
    acc[treatment.treatment] = (acc[treatment.treatment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byAnimal = treatments.reduce(
    (acc, treatment) => {
      const key = treatment.animal.tagNumber;
      if (!acc[key]) {
        acc[key] = {
          animal: treatment.animal,
          treatmentCount: 0,
          totalCost: 0,
          treatments: [],
        };
      }
      acc[key].treatmentCount += 1;
      acc[key].totalCost += treatment.cost || 0;
      acc[key].treatments.push(treatment);
      return acc;
    },
    {} as Record<
      string,
      {
        animal: AnimalInfo;
        treatmentCount: number;
        totalCost: number;
        treatments: typeof treatments;
      }
    >
  );

  return NextResponse.json({
    message: "Treatments report generated successfully",
    report: {
      type: "treatments",
      period: { startDate, endDate },
      summary: {
        totalTreatments,
        totalCost,
        averageCost:
          totalTreatments > 0
            ? Math.round((totalCost / totalTreatments) * 100) / 100
            : 0,
        byType,
      },
      byAnimal: Object.values(byAnimal),
      details: treatments,
    },
  });
}

async function getOverviewReport(startDate: Date, endDate: Date) {
  const [animals, productions, treatments] = await Promise.all([
    prisma.animal.count(),
    prisma.production.findMany({
      where: {
        date: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
    }),
    prisma.treatment.findMany({
      where: {
        treatedAt: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
    }),
  ]);

  const totalProduction = productions.reduce((sum, p) => sum + p.total, 0);
  const totalTreatmentCost = treatments.reduce(
    (sum, t) => sum + (t.cost || 0),
    0
  );

  return NextResponse.json({
    message: "Overview report generated successfully",
    report: {
      type: "overview",
      period: { startDate, endDate },
      summary: {
        totalAnimals: animals,
        totalProduction,
        totalProductionRecords: productions.length,
        totalTreatments: treatments.length,
        totalTreatmentCost,
        averageProductionPerRecord:
          productions.length > 0
            ? Math.round((totalProduction / productions.length) * 100) / 100
            : 0,
      },
    },
  });
}

// Health check for reports endpoint
async function handleHealthCheck() {
  return NextResponse.json({ message: "Reports endpoint is working" });
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetReports, 30000); // 30 second timeout for reports
export const POST = withApiTimeout(handleHealthCheck, 15000); // 5 second timeout for health check
