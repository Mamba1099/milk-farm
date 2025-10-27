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
    const sessionToken = request.cookies.get("session")?.value;
    let userId = null;
    
    if (sessionToken) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as { sub: string };
        userId = decoded.sub;
      } catch (error) {
      }
    }

    const response = createSecureResponse(
      { message: "Logged out successfully" },
      { status: 200 },
      request
    );

    const cookieConfigs = [
      { path: "/" },
      { path: "/", domain: request.nextUrl.hostname },
      { path: "/api" },
    ];

    cookieConfigs.forEach(config => {
      response.cookies.set("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        ...config,
      });
    });

    // Add cache control headers to prevent caching
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
