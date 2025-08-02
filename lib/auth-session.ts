import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function getUserFromSession(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  
  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as {
      sub: string;
      username: string;
      email: string;
      role: string;
      image: string | null;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, username: true },
    });

    return user;
  } catch {
    return null;
  }
}
