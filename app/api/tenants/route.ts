import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, rooms } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const allTenants = await db.select().from(tenants);
    return NextResponse.json(allTenants);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostelId, name, phone, email, identityCard, birthYear, permanentAddress, roomNumber, startDate, deposit } = body;

    // Find the room by number and hostelId
    const roomRecord = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.number, roomNumber), eq(rooms.hostelId, hostelId)))
      .limit(1);

    if (roomRecord.length === 0) {
      return NextResponse.json({ error: `Room ${roomNumber} not found in Hostel ${hostelId}` }, { status: 404 });
    }

    const roomId = roomRecord[0].id;
    const newId = `t_${Date.now()}`;

    const result = await db.transaction(async (tx) => {
      // 1. Insert tenant
      const newTenant = await tx.insert(tenants).values({
        id: newId,
        hostelId,
        name,
        phone,
        email: email || "",
        identityCard,
        birthYear,
        permanentAddress,
        roomId,
        startDate,
        deposit: Number(deposit),
      }).returning();

      // 2. Update room status to 'rented'
      await tx
        .update(rooms)
        .set({ status: "rented" })
        .where(eq(rooms.id, roomId));

      return newTenant[0];
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
