import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not configured");
}

export async function POST(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) return securityError;

  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return createSecureErrorResponse(
        "Invalid credentials",
        401,
        request
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return createSecureErrorResponse(
        "Invalid credentials",
        401,
        request
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      image: user.image,
    };

    const sessionToken = jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: "7d",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    const response = createSecureResponse(
      {
        message: "Login successful",
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

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof ZodError) {
      return createSecureResponse(
        {
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
        request
      );
    }

    return createSecureErrorResponse(
      "Internal server error",
      500,
      request
    );
  }
}

export async function GET(request: NextRequest) {
  return createSecureResponse(
    { message: "Login endpoint is working" },
    { status: 200 },
    request
  );
}
