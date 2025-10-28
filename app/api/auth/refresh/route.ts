import { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not configured");
}

export async function POST(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) return securityError;

  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return createSecureErrorResponse(
        "No refresh token provided",
        401,
        request
      );
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string) as unknown as {
      sub?: string;
      userId?: string;
      type: string;
    };

    if (decoded.type !== "refresh") {
      return createSecureErrorResponse(
        "Invalid token type",
        401,
        request
      );
    }

    const userId = decoded.sub || decoded.userId; 
    if (!userId) {
      return createSecureErrorResponse(
        "Invalid token: missing user ID",
        401,
        request
      );
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
      return createSecureErrorResponse(
        "User not found",
        404,
        request
      );
    }

    let imageUrl = null;
    if (user.image) {
      imageUrl = user.image.startsWith('http') 
        ? user.image 
        : `https://yvasgcgtdnmwkfaqjcvt.supabase.co/storage/v1/object/public/farm-house/${user.image}`;
    }

    const tokenPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      image: user.image,
      image_url: imageUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "30m",
    });

    return createSecureResponse(
      {
        message: "Token refreshed successfully",
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      },
      { status: 200 },
      request
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return createSecureErrorResponse(
      "Invalid or expired refresh token",
      401,
      request
    );
  }
}