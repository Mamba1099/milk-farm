import jwt from "jsonwebtoken";

// Client-side JWT utilities
export interface JWTPayload {
  sub: string; // user id
  username: string;
  email: string;
  role: string;
  image: string | null;
  iat: number;
  exp: number;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return decoded as JWTPayload;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return new Date(decoded.exp * 1000);
}

// Server-side JWT utilities
const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
  expiresIn: string = "1h"
): string | null {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return null;
  }

  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error("JWT signing failed:", error);
    return null;
  }
}
