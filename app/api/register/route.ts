import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerApiSchema } from "@/lib/validators/auth";
import { ZodError } from "zod";
import { withApiTimeout } from "@/lib/api-timeout";

function createResponse(
  data: Record<string, unknown>,
  status: number,
  headers?: Record<string, string>
) {
  const response = NextResponse.json(data, { status });

  // Security headers for production
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // CORS headers (adjust origins for production)
  const origin =
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGIN || "https://yourdomain.com"
      : "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerApiSchema.parse(body);
    const { username, email, password, role, image } = validatedData;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return createResponse(
          { error: "A user with this email already exists" },
          400
        );
      }
      if (existingUser.username === username) {
        return createResponse(
          { error: "A user with this username already exists" },
          400
        );
      }
    }

    let finalRole = role;
    let roleChangeMessage = "";

    if (role === "farm_manager") {
      const existingFarmManager = await prisma.user.findFirst({
        where: { role: "FARM_MANAGER" },
      });

      if (existingFarmManager) {
        finalRole = "employee";
        roleChangeMessage =
          "A farm manager already exists. Account created as employee instead.";
      }
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const prismaRole = finalRole.toUpperCase() as "FARM_MANAGER" | "EMPLOYEE";

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: prismaRole,
        image: image || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    const responseData = {
      message: roleChangeMessage || "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.toLowerCase(),
        image: user.image,
        createdAt: user.createdAt,
      },
      ...(roleChangeMessage && {
        roleChanged: true,
        originalRole: role,
        assignedRole: finalRole,
      }),
    };

    return createResponse(responseData, 201);
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return createResponse(
        {
          error: "Validation failed",
          details: fieldErrors,
        },
        400
      );
    }

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return createResponse(
          { error: "Username or email already exists" },
          400
        );
      }
    }

    return createResponse(
      { error: "Something went wrong. Please try again." },
      500
    );
  }
}

async function handleOptions() {
  return createResponse({}, 200, {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
}

async function handleHealthCheck() {
  return createResponse(
    {
      message: "Registration endpoint is working",
      environment: process.env.NODE_ENV || "development",
    },
    200
  );
}

// Export wrapped handlers with timeout
export const POST = withApiTimeout(handleRegister, 30000); // 25 second timeout
export const OPTIONS = withApiTimeout(handleOptions, 15000); // 5 second timeout
export const GET = withApiTimeout(handleHealthCheck, 15000); // 5 second timeout
