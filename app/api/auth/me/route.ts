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
    const authHeader = request.headers.get("Authorization");
    let accessToken = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7)
      : null;

    if (!accessToken) {
      return createSecureErrorResponse(
        "No access token found",
        401,
        request
      );
    }

    let decodedToken;
    try {
      decodedToken = jwt.decode(accessToken) as {
        sub?: string;
        userId?: string;
        username: string;
        email: string;
        role: string;
      };
    } catch (decodeError) {
      return createSecureErrorResponse("Invalid token format", 401, request);
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      sub?: string;
      userId?: string;
      username: string;
      email: string;
      role: string;
    };

    const userId = decoded.sub || decoded.userId;
    if (!userId) {
      return createSecureErrorResponse("Invalid token: missing user ID", 401, request);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
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
          image_url: user.image,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
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
