import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { uploadUserImage } from "@/lib/user-storage";
import { getPublicImageUrl } from "@/supabase/storage/client";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }

  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    if (!["FARM_MANAGER", "EMPLOYEE"].includes(user.role)) {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const url = new URL(request.url);
    const statsOnly = url.searchParams.get("stats") === "true";

    if (statsOnly) {
      const totalUsers = await prisma.user.count();
      const farmManagers = await prisma.user.count({
        where: { role: "FARM_MANAGER" },
      });
      const employees = await prisma.user.count({
        where: { role: "EMPLOYEE" },
      });

      const userStats = {
        totalUsers,
        activeUsers: totalUsers,
        farmManagers,
        employees,
      };

      return createSecureResponse({
        message: "User statistics retrieved successfully",
        stats: userStats,
      }, { status: 200 }, request);
    }

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.user.count();

    const usersWithImageUrls = users.map(user => ({
      ...user,
      image_url: user.image ? getPublicImageUrl(user.image) : null,
    }));

    return createSecureResponse({
      message: "Users retrieved successfully",
      users: usersWithImageUrls,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error fetching users:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function POST(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }

  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, unknown> = {};
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      imageFile = formData.get("image") as File;

      if (data.image) {
        delete data.image;
      }
    } else {
      const body = await request.json();
      data = body;
    }

    const { username, email, password, role } = data;

    if (!username || !email || !password || !role) {
      return createSecureErrorResponse(
        "Username, email, password, and role are required",
        400,
        request
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email as string)) {
      return createSecureErrorResponse(
        "Please enter a valid email address",
        400,
        request
      );
    }

    if ((password as string).length < 8) {
      return createSecureErrorResponse(
        "Password must be at least 8 characters long",
        400,
        request
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password as string)) {
      return createSecureErrorResponse(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        400,
        request
      );
    }

    if ((username as string).length < 3) {
      return createSecureErrorResponse(
        "Username must be at least 3 characters long",
        400,
        request
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username as string)) {
      return createSecureErrorResponse(
        "Username can only contain letters, numbers, underscores, and hyphens",
        400,
        request
      );
    }

    if (!["FARM_MANAGER", "EMPLOYEE"].includes(role as string)) {
      return createSecureErrorResponse(
        "Invalid role. Must be FARM_MANAGER or EMPLOYEE",
        400,
        request
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username as string }, { email: email as string }],
      },
    });

    if (existingUser) {
      return createSecureErrorResponse(
        "User with this username or email already exists",
        409,
        request
      );
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadUserImage(imageFile);
      if (uploadResult.error) {
        return createSecureErrorResponse(uploadResult.error, 500, request);
      }
      imageUrl = uploadResult.imagePath;
    }

    const hashedPassword = await bcrypt.hash(password as string, 12);

    const newUser = await prisma.user.create({
      data: {
        username: username as string,
        email: email as string,
        password: hashedPassword,
        role: role as "FARM_MANAGER" | "EMPLOYEE",
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

    return createSecureResponse({
      message: "User created successfully",
      user: {
        ...newUser,
        image_url: newUser.image ? getPublicImageUrl(newUser.image) : null,
      },
    }, { status: 201 }, request);

  } catch (error) {
    console.error("Error creating user:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function PUT(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) {
    return securityError;
  }

  try {
    return createSecureResponse({
      message: "Users endpoint is working",
      timestamp: new Date().toISOString(),
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error in users health check:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
