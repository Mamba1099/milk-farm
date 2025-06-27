import { NextResponse } from "next/server";

export function handleError(error: unknown) {
  console.error("API Error:", error);
  return NextResponse.json(
    {
      success: false,
      error: "Internal server error",
      details: (error as Error).message,
    },
    { status: 500 }
  );
}
