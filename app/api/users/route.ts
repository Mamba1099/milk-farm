import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiTimeout } from "@/lib/api-timeout";
import { verifyToken } from "@/lib/jwt-utils";
import bcrypt from "bcryptjs";

async function handleGetUsers(request: NextRequest) {
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

    // Check if user has admin privileges (only farm managers can see users)
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

    const url = new URL(request.url);
    const statsOnly = url.searchParams.get("stats") === "true";

    if (statsOnly) {
      // Get user statistics only
      const [totalUsers, farmManagers, employees] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { role: "FARM_MANAGER" },
        }),
        prisma.user.count({
          where: { role: "EMPLOYEE" },
        }),
      ]);

      const userStats = {
        totalUsers,
        activeUsers: totalUsers, // For now, consider all users as active
        farmManagers,
        employees,
      };

      return NextResponse.json({
        message: "User statistics retrieved successfully",
        stats: userStats,
      });
    }

    // Get all users with pagination
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
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
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      message: "Users retrieved successfully",
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleCreateUser(request: NextRequest) {
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
    const { username, email, password, role } = body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: "Username, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["FARM_MANAGER", "EMPLOYEE"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be FARM_MANAGER or EMPLOYEE" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleHealthCheck() {
  return NextResponse.json({ message: "Users endpoint is working" });
}

// Export wrapped handlers with timeout
export const GET = withApiTimeout(handleGetUsers, 15000); // 15 second timeout
export const POST = withApiTimeout(handleCreateUser, 15000); // 15 second timeout
export const PUT = withApiTimeout(handleHealthCheck, 5000); // 5 second timeout for health check
