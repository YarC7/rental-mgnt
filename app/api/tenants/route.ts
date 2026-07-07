import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, rooms } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const includeDeleted = url.searchParams.get("includeDeleted") === "true";

    let query = db.select().from(tenants);
    if (!includeDeleted) {
      query = query.where(isNull(tenants.deletedAt)) as any;
    }
    const allTenants = await query;
    return NextResponse.json(allTenants);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostelId, name, phone, email, identityCard, dob, gender, birthYear, permanentAddress, identityCardIssueDate, roomNumber, startDate, deposit, isPrimary } = body;

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
      // 1. If this tenant is primary, set all other tenants in the same room to non-primary
      if (isPrimary) {
        await tx
          .update(tenants)
          .set({ isPrimary: false })
          .where(eq(tenants.roomId, roomId));
      }

      // 2. Insert tenant
      const newTenant = await tx.insert(tenants).values({
        id: newId,
        hostelId,
        name,
        phone,
        email: email || "",
        identityCard,
        dob: dob || "",
        gender: gender || "",
        birthYear,
        permanentAddress,
        identityCardIssueDate: identityCardIssueDate || "",
        roomId,
        startDate: new Date(startDate),
        deposit: Number(deposit),
        isPrimary: !!isPrimary,
      }).returning();

      // 3. Update room status to 'rented'
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
