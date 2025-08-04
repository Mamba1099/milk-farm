import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function getUserFromSession(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  
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
      sub: string;
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, username: true },
    });

    return user;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("JWT Token expired:", error.expiredAt);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log("JWT Error:", error.message);
    } else {
      console.log("Auth session error:", error);
    }
    return null;
  }
}
