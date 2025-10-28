import { NextRequest } from "next/server";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
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

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export async function POST(request: NextRequest) {
  
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

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET as string, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(
      { sub: user.id, userId: user.id, type: "refresh" },
      JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    const response = createSecureResponse(
      {
        message: "Login successful",
        accessToken,
        refreshToken,
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

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
    request
  );
}
