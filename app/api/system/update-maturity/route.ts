import { NextRequest } from "next/server";
import {
  updateAnimalMaturityStatus,
  updateProductionCarryOver,
} from "@/lib/animal-maturity";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const body = await request.json();
    const operation = body.operation;

    if (!operation) {
      return createSecureErrorResponse(
        "Operation is required. Use 'maturity', 'carry-over', or 'both'",
        400,
        request
      );
    }

    let result;
    switch (operation) {
      case "maturity":
        result = await updateAnimalMaturityStatus();
        break;
      case "carry-over":
        result = await updateProductionCarryOver();
        break;
      case "both":
        const maturityResult = await updateAnimalMaturityStatus();
        const carryOverResult = await updateProductionCarryOver();
        result = {
          maturity: maturityResult,
          carryOver: carryOverResult,
        };
        break;
      default:
        return createSecureErrorResponse(
          "Invalid operation. Use 'maturity', 'carry-over', or 'both'",
          400,
          request
        );
    }

    return createSecureResponse({
      message: "System update completed successfully",
      result,
      timestamp: new Date().toISOString(),
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error running system update:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to run system update";
    return createSecureErrorResponse(errorMessage, 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
