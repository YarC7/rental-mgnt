import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";

export async function GET() {
  try {
    const allRooms = await db.select().from(rooms);
    return NextResponse.json(allRooms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostelId, number, price, area, status, description } = body;
    
    const newId = `r_${Date.now()}`;

    const newRoom = await db.insert(rooms).values({
      id: newId,
      hostelId,
      number,
      price: Number(price),
      area: Number(area),
      status: status || "empty",
      description: description || "",
    }).returning();

    return NextResponse.json(newRoom[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
