import { NextRequest } from "next/server";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";

export async function POST(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) return securityError;

  try {
    const body = await request.json();
    const { userId } = body;

    const response = createSecureResponse(
      { message: "Logged out successfully" },
      { status: 200 },
      request
    );
    
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return createSecureErrorResponse(
      "Internal server error",
      500,
      request
    );
  }
}
