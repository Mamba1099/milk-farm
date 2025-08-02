import { NextRequest } from "next/server";
import { 
  validateSecurity, 
  createSecureErrorResponse 
} from "@/lib/security";
import { 
  getProductionReport,
  getAnimalsReport,
  getTreatmentsReport,
  getOverviewReport
} from "@/lib/services";

export async function GET(request: NextRequest) {
  try {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }

    const url = new URL(request.url);
    const reportType = url.searchParams.get("type");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

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
        return createSecureErrorResponse(
          "Invalid report type. Supported types: production, animals, treatments, overview",
          400
        );
    }
  } catch (error) {
    console.error("Error generating reports:", error);
    return createSecureErrorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }

    return createSecureErrorResponse("Method not implemented", 501);
  } catch (error) {
    console.error("Error in reports POST:", error);
    return createSecureErrorResponse("Internal server error", 500);
  }
}
