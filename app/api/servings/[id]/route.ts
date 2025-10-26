import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || (user.role !== "FARM_MANAGER" && user.role !== "EMPLOYEE")) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const { id } = await params;
    if (!id) {
      return createSecureErrorResponse("Serving ID is required", 400, request);
    }

    const existingServing = await prisma.serving.findUnique({
      where: { id },
    });
    if (!existingServing) {
      return createSecureErrorResponse("Serving record not found", 404, request);
    }

    const body = await request.json();
    const { outcome, actualBirthDate } = body;

      const updatedServing = await prisma.serving.update({
        where: { id },
        data: {
          ...(outcome !== undefined ? { outcome } : {}),
          ...(actualBirthDate !== undefined
            ? { actualBirthDate: actualBirthDate ? new Date(actualBirthDate) : undefined }
            : {}),
        },
      });

    return createSecureResponse({
      message: "Serving record updated successfully",
      serving: updatedServing,
    }, { status: 200 }, request);
  } catch (error) {
    console.error("Error updating serving record:", error);
    return createSecureErrorResponse("Failed to update serving record", 500, request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const { id } = await params;

    if (!id) {
      return createSecureErrorResponse("Serving ID is required", 400, request);
    }

    const existingServing = await prisma.serving.findUnique({
      where: { id },
    });

    if (!existingServing) {
      return createSecureErrorResponse("Serving record not found", 404, request);
    }

    await prisma.serving.delete({
      where: { id },
    });

    return createSecureResponse({
      message: "Serving record deleted successfully",
    }, { status: 200 }, request);
  } catch (error) {
    console.error("Error deleting serving record:", error);
    return createSecureErrorResponse("Failed to delete serving record", 500, request);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user || !["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const { id } = await params;

    if (!id) {
      return createSecureErrorResponse("Serving ID is required", 400, request);
    }

    const serving = await prisma.serving.findUnique({
      where: { id },
      include: {
        female: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!serving) {
      return createSecureErrorResponse("Serving record not found", 404, request);
    }

    return createSecureResponse({ serving }, { status: 200 }, request);
  } catch (error) {
    console.error("Error fetching serving record:", error);
    return createSecureErrorResponse("Failed to fetch serving record", 500, request);
  }
}


