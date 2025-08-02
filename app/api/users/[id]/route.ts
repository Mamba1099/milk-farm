import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSecurity, createSecureResponse, createSecureErrorResponse } from "@/lib/security";
import { getUserFromSession } from "@/lib/auth-session";
import { uploadUserImage, deleteUserImage } from "@/lib/user-storage";
import { getPublicImageUrl } from "@/supabase/storage/client";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    const { id } = await params;

    if (user.role !== "FARM_MANAGER" && user.id !== id) {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const foundUser = await prisma.user.findUnique({
      where: { id },
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

    if (!foundUser) {
      return createSecureErrorResponse("User not found", 404, request);
    }

    return createSecureResponse({
      message: "User retrieved successfully",
      user: {
        ...foundUser,
        image_url: foundUser.image ? getPublicImageUrl(foundUser.image) : null,
      },
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error fetching user:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const { id } = await params;

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

    const { username, email, role, password } = data;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return createSecureErrorResponse("User not found", 404, request);
    }

    if (username && (username as string).length < 3) {
      return createSecureErrorResponse(
        "Username must be at least 3 characters long",
        400,
        request
      );
    }

    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username as string)) {
        return createSecureErrorResponse(
          "Username can only contain letters, numbers, underscores, and hyphens",
          400,
          request
        );
      }
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email as string)) {
        return createSecureErrorResponse(
          "Please enter a valid email address",
          400,
          request
        );
      }
    }

    if (password && (password as string).length < 8) {
      return createSecureErrorResponse(
        "Password must be at least 8 characters long",
        400,
        request
      );
    }

    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(password as string)) {
        return createSecureErrorResponse(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
          400,
          request
        );
      }
    }

    if (role && !["FARM_MANAGER", "EMPLOYEE"].includes(role as string)) {
      return createSecureErrorResponse(
        "Invalid role. Must be FARM_MANAGER or EMPLOYEE",
        400,
        request
      );
    }

    const updateData: {
      username?: string;
      email?: string;
      role?: "FARM_MANAGER" | "EMPLOYEE";
      password?: string;
      image?: string;
    } = {};

    if (username && (username as string).trim() !== "") {
      updateData.username = username as string;
    }
    if (email && (email as string).trim() !== "") {
      updateData.email = email as string;
    }
    if (role && ["FARM_MANAGER", "EMPLOYEE"].includes(role as string)) {
      updateData.role = role as "FARM_MANAGER" | "EMPLOYEE";
    }
    if (password && (password as string).trim() !== "") {
      updateData.password = await bcrypt.hash(password as string, 12);
    }

    if (imageFile && imageFile.size > 0) {
      if (existingUser.image) {
        await deleteUserImage(existingUser.image);
      }
      const uploadResult = await uploadUserImage(imageFile);
      if (uploadResult.error) {
        return createSecureErrorResponse(uploadResult.error, 500, request);
      }
      updateData.image = uploadResult.imageUrl;
    }

    if (username || email) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(username ? [{ username: username as string }] : []),
                ...(email ? [{ email: email as string }] : []),
              ],
            },
          ],
        },
      });

      if (conflictUser) {
        return createSecureErrorResponse(
          "Username or email already exists",
          409,
          request
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return createSecureResponse({
      message: "User updated successfully",
      user: {
        ...updatedUser,
        image_url: updatedUser.image ? getPublicImageUrl(updatedUser.image) : null,
      },
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error updating user:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const securityError = validateSecurity(request);
    if (securityError) {
      return securityError;
    }
    const user = await getUserFromSession(request);
    if (!user) {
      return createSecureErrorResponse("Authentication required", 401, request);
    }

    if (user.role !== "FARM_MANAGER") {
      return createSecureErrorResponse("Insufficient permissions", 403, request);
    }

    const { id } = await params;

    if (user.id === id) {
      return createSecureErrorResponse("Cannot delete your own account", 400, request);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        image: true,
      },
    });

    if (!existingUser) {
      return createSecureErrorResponse("User not found", 404, request);
    }

    if (existingUser.image) {
      await deleteUserImage(existingUser.image);
    }

    await prisma.user.delete({
      where: { id },
    });

    return createSecureResponse({
      message: "User deleted successfully",
    }, { status: 200 }, request);

  } catch (error) {
    console.error("Error deleting user:", error);
    return createSecureErrorResponse("Internal server error", 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, { status: 200 }, request);
}
