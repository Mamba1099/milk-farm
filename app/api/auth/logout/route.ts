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
    const response = createSecureResponse(
      { message: "Logged out successfully" },
      { status: 200 },
      request
    );

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

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
