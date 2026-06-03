import { NextResponse } from "next/server";
import { db } from "@/db";
import { hostels } from "@/db/schema";

export async function GET() {
  try {
    const allHostels = await db.select().from(hostels);
    return NextResponse.json(allHostels);
  } catch (error: any) {
    console.error("GET /api/hostels error:", error);
    return NextResponse.json(
      { 
        error: error.message, 
        cause: error.cause ? { message: error.cause.message, code: error.cause.code } : undefined,
        stack: error.stack 
      }, 
      { status: 500 }
    );
  }
}
