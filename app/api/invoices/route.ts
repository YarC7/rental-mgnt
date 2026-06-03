import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, rooms } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const allInvoices = await db.select().from(invoices);
    return NextResponse.json(allInvoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostelId, roomNumber, tenantName, month, roomPrice, electricityCost, waterCost, otherServicesCost, total, status } = body;

    const roomRecord = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.number, roomNumber), eq(rooms.hostelId, hostelId)))
      .limit(1);

    const roomId = roomRecord.length > 0 ? roomRecord[0].id : null;
    const newId = `i_${Date.now()}`;

    const newInvoice = await db.insert(invoices).values({
      id: newId,
      hostelId,
      roomId,
      roomNumber,
      tenantName,
      month,
      roomPrice: Number(roomPrice),
      electricityCost: Number(electricityCost),
      waterCost: Number(waterCost),
      otherServicesCost: Number(otherServicesCost),
      total: Number(total),
      status: status || "unpaid",
      createdAt: new Date(),
    }).returning();

    return NextResponse.json(newInvoice[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
