import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiTimeout } from "@/lib/api-timeout";
import { verifyToken } from "@/lib/jwt-utils";
import bcrypt from "bcryptjs";

async function handleGetUser(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user has admin privileges or is requesting their own data
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true },
    });

    if (
      !currentUser ||
      (currentUser.role !== "FARM_MANAGER" && decoded.sub !== params.id)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
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

    const body = await request.json();
    const { username, email, role, password } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      username?: string;
      email?: string;
      role?: string;
      password?: string;
    } = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role && ["FARM_MANAGER", "EMPLOYEE"].includes(role)) {
      updateData.role = role;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Check for username/email conflicts
    if (username || email) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
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
      where: { id: params.id },
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
  { params }: { params: { id: string } }
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

    // Prevent self-deletion
    if (decoded.sub === params.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: params.id },
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
