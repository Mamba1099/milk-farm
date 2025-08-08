import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { ZodError } from "zod";
import {
  validateSecurity,
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security";
import { getPublicImageUrl } from "@/supabase/storage/client";

export async function POST(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      console.log("Processing multipart/form-data request");
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      
      console.log("Form data keys:", Array.from(formData.keys()));
    } else {
      console.log("Processing JSON request");
      const body = await request.json();
      data = body;
    }

    const validatedData = registerSchema.parse(data);
    const { username, email, password, role } = validatedData;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return createSecureErrorResponse(
          "A user with this email already exists",
          400,
          request
        );
      }
      if (existingUser.username === username) {
        return createSecureErrorResponse(
          "A user with this username already exists",
          400,
          request
        );
      }
    }

    let finalRole = role;
    let roleChangeMessage = "";

    if (role === "FARM_MANAGER") {
      const existingFarmManager = await prisma.user.findFirst({
        where: { role: "FARM_MANAGER" },
      });

      if (existingFarmManager) {
        finalRole = "EMPLOYEE";
        roleChangeMessage =
          "A farm manager already exists. Account created as employee instead.";
      }
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const prismaRole = finalRole.toUpperCase() as "FARM_MANAGER" | "EMPLOYEE";

    let imageUrl = null;
    
    // Check if imagePath was provided from client-side upload
    if (data.imagePath && typeof data.imagePath === 'string') {
      imageUrl = data.imagePath;
      console.log("Using imagePath from client:", imageUrl);
    } else {
      console.log("No imagePath provided");
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: prismaRole,
        image: imageUrl,
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
      success: true,
      message: roleChangeMessage || "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.toLowerCase(),
        image: user.image,
        image_url: user.image ? getPublicImageUrl(user.image) : null,
        createdAt: user.createdAt,
      },
      ...(roleChangeMessage && {
        roleChanged: true,
        originalRole: role,
        assignedRole: finalRole,
      }),
    };

    return createSecureResponse(
      responseData,
      { status: 201 },
      request
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return createSecureResponse(
        {
          success: false,
          error: "Validation failed",
          details: fieldErrors,
        },
        { status: 400 },
        request
      );
    }

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return createSecureErrorResponse(
          "Username or email already exists",
          400,
          request
        );
      }
    }

    return createSecureErrorResponse(
      "Something went wrong. Please try again.",
      500,
      request
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
    request
  );
}

export async function GET(request: NextRequest) {
  return createSecureResponse(
    {
      success: true,
      message: "Registration endpoint is working",
      environment: process.env.NODE_ENV || "development",
    },
    { status: 200 },
    request
  );
}
