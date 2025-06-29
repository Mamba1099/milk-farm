import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { withApiTimeout } from "@/lib/api-timeout";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not configured");
}

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT payload
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      image: user.image,
    };

    // Generate access token (expires in 1 hour)
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Generate refresh token (expires in 7 days)
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // Return success response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
      },
      token: accessToken,
    });

    // Set refresh token as httpOnly cookie for security
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check for login endpoint
async function handleHealthCheck() {
  return NextResponse.json({ message: "Login endpoint is working" });
}

// Export wrapped handlers with timeout
export const POST = withApiTimeout(handleLogin, 30000); // 20 second timeout
export const GET = withApiTimeout(handleHealthCheck, 10000); // 5 second timeout
