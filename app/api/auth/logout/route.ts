import { NextRequest, NextResponse } from "next/server";
import { withApiTimeout } from "@/lib/api-timeout";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleLogout(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      message: "Logged out successfully",
    });

    // Clear the refresh token cookie
    response.cookies.set("refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export wrapped handler with timeout
export const POST = withApiTimeout(handleLogout, 10000); // 10 second timeout
