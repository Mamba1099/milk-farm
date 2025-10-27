import { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function getUserFromSession(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let sessionToken: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    sessionToken = authHeader.substring(7);
  } else {
    sessionToken = undefined;
  }
  
  if (!sessionToken) {
    return null;
  }

  try {
    const decodedUnverified = jwt.decode(sessionToken) as {
      sub: string;
      username: string;
      email: string;
      role: string;
      image: string | null;
      exp: number;
      sessionEndTime?: string;
    };
    if (decodedUnverified?.sessionEndTime) {
      const sessionEndTime = new Date(decodedUnverified.sessionEndTime);
      const currentTime = new Date();
      
      if (currentTime >= sessionEndTime) {
        return null; 
      }
    }

    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as {
      sub?: string;
      userId?: string;
      username: string;
      email: string;
      role: string;
      image: string | null;
      exp: number;
    };
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return null;
    }

    const userId = decoded.sub || decoded.userId;
    if (!userId) {
      console.error("No user ID found in decoded token:", decoded);
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, username: true },
    });

    return user;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
    } else if (error instanceof jwt.JsonWebTokenError) {
    } else {
    }
    return null;
  }
}
