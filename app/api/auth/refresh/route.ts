import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { withApiTimeout } from "@/lib/api-timeout";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not configured");
}

interface RefreshTokenPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  image: string | null;
}

async function handleRefreshToken(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get("refresh-token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Create new access token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      image: user.image,
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create new refresh token
    const newRefreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Return new access token
    const response = NextResponse.json({
      message: "Token refreshed successfully",
      token: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
      },
    });

    // Set new refresh token
    response.cookies.set("refresh-token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);

    // Clear invalid refresh token
    const response = NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );

    response.cookies.set("refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}

// Export wrapped handler with timeout
export const POST = withApiTimeout(handleRefreshToken, 20000); // 15 second timeout
