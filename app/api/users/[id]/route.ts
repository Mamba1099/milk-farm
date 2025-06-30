import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiTimeout } from "@/lib/api-timeout";
import { verifyToken } from "@/lib/jwt-utils";
import bcrypt from "bcryptjs";
import { uploadUserAvatar } from "@/lib/file-storage";

async function handleGetUser(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if user has admin privileges or is requesting their own data
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true },
    });

    if (
      !currentUser ||
      (currentUser.role !== "FARM_MANAGER" && decoded.sub !== id)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleUpdateUser(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user has admin privileges
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if request contains multipart form data (image upload)
    const contentType = request.headers.get("content-type");
    let username, email, role, password, imageFile;

    if (contentType?.includes("multipart/form-data")) {
      // Handle form data with image upload
      const formData = await request.formData();
      username = formData.get("username")?.toString() || undefined;
      email = formData.get("email")?.toString() || undefined;
      role = formData.get("role")?.toString() || undefined;
      password = formData.get("password")?.toString() || undefined;
      imageFile = formData.get("image") as File;

      // Convert empty strings to undefined
      if (username === "") username = undefined;
      if (email === "") email = undefined;
      if (role === "") role = undefined;
      if (password === "") password = undefined;
    } else {
      // Handle regular JSON data
      const body = await request.json();
      ({ username, email, role, password } = body);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate fields if provided
    if (username !== undefined && username !== null && username !== "") {
      if (username.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters long" },
          { status: 400 }
        );
      }
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          {
            error:
              "Username can only contain letters, numbers, underscores, and hyphens",
          },
          { status: 400 }
        );
      }
    }

    if (email !== undefined && email !== null && email !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 }
        );
      }
    }

    if (password !== undefined && password !== null && password !== "") {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 }
        );
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(password)) {
        return NextResponse.json(
          {
            error:
              "Password must contain at least one uppercase letter, one lowercase letter, and one number",
          },
          { status: 400 }
        );
      }
    }

    if (
      role !== undefined &&
      role !== null &&
      role !== "" &&
      !["FARM_MANAGER", "EMPLOYEE"].includes(role)
    ) {
      return NextResponse.json(
        { error: "Invalid role. Must be FARM_MANAGER or EMPLOYEE" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      username?: string;
      email?: string;
      role?: string;
      password?: string;
      image?: string;
    } = {};

    if (username && username.trim() !== "") updateData.username = username;
    if (email && email.trim() !== "") updateData.email = email;
    if (role && ["FARM_MANAGER", "EMPLOYEE"].includes(role)) {
      updateData.role = role;
    }
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      const imageUrl = await uploadUserAvatar(imageFile);
      if (imageUrl) {
        updateData.image = imageUrl;
      } else {
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Check for username/email conflicts
    if (username || email) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : []),
              ],
            },
          ],
        },
      });

      if (conflictUser) {
        return NextResponse.json(
          { error: "Username or email already exists" },
          { status: 409 }
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

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleDeleteUser(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user has admin privileges
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "FARM_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent self-deletion
    if (decoded.sub === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetUser, 20000);
export const PUT = withApiTimeout(handleUpdateUser, 20000);
export const DELETE = withApiTimeout(handleDeleteUser, 20000);
