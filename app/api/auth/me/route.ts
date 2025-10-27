import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { 
  validateSecurity, 
  createSecureResponse, 
  createSecureErrorResponse 
} from "@/lib/security";

export async function GET(request: NextRequest) {
  const securityError = validateSecurity(request);
  if (securityError) return securityError;

  try {
    const sessionToken = request.cookies.get("session")?.value;

    if (!sessionToken) {
      return createSecureErrorResponse(
        "No session found",
        401,
        request
      );
    }

    let decodedToken;
    try {
      decodedToken = jwt.decode(sessionToken) as {
        sub: string;
        username: string;
        email: string;
        role: string;
        image: string | null;
        sessionStartTime?: string;
        sessionEndTime?: string;
        sessionDuration?: number;
      };
    } catch (decodeError) {
      const response = createSecureErrorResponse("Invalid token format", 401, request);
      response.cookies.set("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    if (decodedToken?.sessionEndTime) {
      const sessionEndTime = new Date(decodedToken.sessionEndTime);
      const currentTime = new Date();
      
      if (currentTime >= sessionEndTime) {
        const response = createSecureErrorResponse("Session expired", 401, request);
        response.cookies.set("session", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 0,
          path: "/",
        });
        return response;
      }
    }

    // Now verify the JWT token
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as {
      sub: string;
      username: string;
      email: string;
      role: string;
      image: string | null;
      sessionStartTime?: string;
      sessionEndTime?: string;
      sessionDuration?: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      const response = createSecureErrorResponse("User not found", 404, request);
      response.cookies.set("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    return createSecureResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          image: user.image,
          createdAt: user.createdAt.toISOString(),
        },
        session: {
          startTime: decoded.sessionStartTime,
          endTime: decoded.sessionEndTime,
          duration: decoded.sessionDuration,
          timeRemaining: decoded.sessionEndTime ? 
            Math.max(0, Math.floor((new Date(decoded.sessionEndTime).getTime() - new Date().getTime()) / 1000)) : 
            null,
        },
      },
      { status: 200 },
      request
    );
  } catch (error) {
    console.error("Auth verification error:", error);
    const response = createSecureErrorResponse(
      "Invalid or expired token",
      401,
      request
    );
    
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    
    return response;
  }
}
