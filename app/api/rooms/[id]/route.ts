import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updateData: any = {};
    if (body.number !== undefined) updateData.number = body.number;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.area !== undefined) updateData.area = Number(body.area);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;

    if (Object.keys(updateData).length === 0) {
      const currentRoom = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
      if (currentRoom.length === 0) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      return NextResponse.json(currentRoom[0]);
    }

    const updatedRoom = await db
      .update(rooms)
      .set(updateData)
      .where(eq(rooms.id, id))
      .returning();

    if (updatedRoom.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRoom[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deletedRoom = await db.delete(rooms).where(eq(rooms.id, id)).returning();
    
    if (deletedRoom.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(deletedRoom[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
