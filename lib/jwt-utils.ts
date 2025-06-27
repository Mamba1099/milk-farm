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
