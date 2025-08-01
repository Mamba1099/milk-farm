import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";

export async function GET(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) return securityError;

  try {
    const sessionToken = request.cookies.get("session")?.value;

    if (!sessionToken) {
      return createSecureErrorResponse(
        "No session found",
        401,
        request
      );
    }

    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as {
      sub: string;
      username: string;
      email: string;
      role: string;
      image: string | null;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return createSecureErrorResponse("User not found", 404, request);
    }

    return createSecureResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          image: user.image,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 200 },
      request
    );
  } catch (error) {
    console.error("Auth verification error:", error);
    return createSecureErrorResponse(
      "Invalid or expired token",
      401,
      request
    );
  }
}
